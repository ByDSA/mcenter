import { assertFound } from "#shared/utils/http/validation";
import { Injectable } from "@nestjs/common";
import { EpisodeRepository } from "#episodes/index";
import { Episode, EpisodeId, compareEpisodeId } from "#episodes/models";
import { HistoryListEntryRepository, HistoryListRepository } from "./repositories";
import { HistoryEntry, HistoryList, HistoryListId, createHistoryEntryByEpisodeFullId as createHistoryEntryByEpisodeId } from "./models";

type HistoryAndEpisodeParams = ( {
  episode: Episode;
} | {
  episodeFullId: EpisodeId;
} ) & ( {
  historyList: HistoryList;
} | {
  historyListId: HistoryListId;
} );

@Injectable()
export class HistoryListService {
  constructor(
    private episodeRepository: EpisodeRepository,
    private historyListRepository: HistoryListRepository,
    private historyEntryRepository: HistoryListEntryRepository,
  ) {
  }

  async #getHistoryListFromParams(params: HistoryAndEpisodeParams): Promise<HistoryList> {
    let historyList: HistoryList;

    if ("historyList" in params)
      historyList = params.historyList;
    else if ("historyListId" in params) {
      const got = await this.historyListRepository.getOneByIdOrCreate(params.historyListId);

      assertFound(got);

      historyList = got;
    } else
      throw new Error("No se ha especificado el historyList");

    return historyList;
  }

  #getHistoryListIdFromParams(params: HistoryAndEpisodeParams): HistoryListId {
    let historyListId: HistoryListId;

    if ("historyList" in params)
      historyListId = params.historyList.id;
    else if ("historyListId" in params)

      historyListId = params.historyListId;
    else
      throw new Error("No se ha especificado el historyList");

    return historyListId;
  }

  // eslint-disable-next-line require-await
  async #getEpisodeIdFromParams(params: HistoryAndEpisodeParams): Promise<EpisodeId> {
    let episodeId: EpisodeId;

    if ("episode" in params)
      episodeId = params.episode.id;
    else if ("episodeFullId" in params)
      episodeId = params.episodeFullId;
    else
      throw new Error("No se ha especificado el episodio");

    return episodeId;
  }

  async #getEpisodeFromParams(params: HistoryAndEpisodeParams): Promise<Episode> {
    let episode: Episode;

    if ("episode" in params)

      episode = params.episode;
    else if ("episodeFullId" in params) {
      const got = await this.episodeRepository.getOneById(params.episodeFullId);

      assertFound(got);

      episode = got;
    } else
      throw new Error("No se ha especificado el episodio");

    return episode;
  }

  async findLastHistoryEntryForEpisodeId(
    params: HistoryAndEpisodeParams,
  ): Promise<HistoryEntry | null> {
    const episodeFullId: EpisodeId = await this.#getEpisodeIdFromParams(params);
    const historyList: HistoryList = await this.#getHistoryListFromParams(params);
    const historyEntry = historyList.entries.findLast(
      (h) => compareEpisodeId(h.episodeId, episodeFullId),
    );

    if (!historyEntry)
      return null;

    return historyEntry;
  }

  async addEpisodeToHistory(params: HistoryAndEpisodeParams) {
    const episode: Episode = await this.#getEpisodeFromParams(params);
    const newEntry: HistoryEntry = createHistoryEntryByEpisodeId(episode.id);
    const historyListId = this.#getHistoryListIdFromParams(params);

    await this.historyEntryRepository.createOneBySuperId(historyListId, newEntry);

    await this.episodeRepository.patchOneByIdAndGet(episode.id, {
      lastTimePlayed: newEntry.date.timestamp,
    } );
  }

  async addEpisodesToHistory(
    { episodes, historyListId }: {episodes: Episode[];
historyListId: HistoryListId;},
  ) {
    // TODO: usar bulk insert (quitar await en for)
    for (const episode of episodes) {
      await this.addEpisodeToHistory( {
        episode,
        historyListId,
      } );
    }
  }

  async removeLastTimeEpisodeFromHistory(params: HistoryAndEpisodeParams) {
    const historyList = await this.#getHistoryListFromParams(params);
    const episodeFullId: EpisodeId = await this.#getEpisodeIdFromParams(params);
    const historyEntryIndex = historyList.entries.findLastIndex(
      (h: HistoryEntry) => compareEpisodeId(h.episodeId, episodeFullId),
    );

    if (historyEntryIndex === -1)
      return;

    const deletedHistoryEntry = historyList.entries[historyEntryIndex];

    historyList.entries.splice(historyEntryIndex, 1);

    await this.historyListRepository.updateOneById(historyList.id, historyList);

    const episode: Episode = await this.#getEpisodeFromParams(params);

    if (deletedHistoryEntry.date.timestamp === episode.lastTimePlayed) {
      const lastTimeHistoryEntry = await this.findLastHistoryEntryForEpisodeId( {
        historyList,
        episodeFullId,
      } );

      await this.episodeRepository.patchOneByIdAndGet(episodeFullId, {
        lastTimePlayed: lastTimeHistoryEntry?.date.timestamp,
      } );
    }
  }
}
