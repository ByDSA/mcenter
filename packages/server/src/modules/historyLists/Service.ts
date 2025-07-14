import { Injectable } from "@nestjs/common";
import { assertFound } from "$shared/utils/http/validation";
import { EpisodeRepository } from "#episodes/index";
import { Episode, EpisodeEntity, EpisodeId, compareEpisodeId } from "#episodes/models";
import { HistoryListEntryRepository, HistoryListRepository } from "./repositories";
import { HistoryEntry, HistoryListEntity, HistoryListId, createHistoryEntryByEpisodeFullId as createHistoryEntryByEpisodeId } from "./models";

type HistoryAndEpisodeParams = ( {
  episode: EpisodeEntity;
} | {
  episodeFullId: EpisodeId;
} ) & ( {
  historyList: HistoryListEntity;
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

  static providers = Object.freeze([
    EpisodeRepository,
    ...EpisodeRepository.providers,
    HistoryListRepository,
    ...HistoryListRepository.providers,
    HistoryListEntryRepository,
    ...HistoryListEntryRepository.providers,
  ]);

  async #getHistoryListFromParams(params: HistoryAndEpisodeParams): Promise<HistoryListEntity> {
    let historyList: HistoryListEntity;

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

  async #getEpisodeFromParams(params: HistoryAndEpisodeParams): Promise<EpisodeEntity> {
    let episode: EpisodeEntity;

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
    const historyList: HistoryListEntity = await this.#getHistoryListFromParams(params);
    const historyEntry = historyList.entries.findLast(
      (h) => compareEpisodeId(h.episodeId, episodeFullId),
    );

    if (!historyEntry)
      return null;

    return historyEntry;
  }

  async addEpisodeToHistory(params: HistoryAndEpisodeParams) {
    const episode: EpisodeEntity = await this.#getEpisodeFromParams(params);
    const newEntry: HistoryEntry = createHistoryEntryByEpisodeId(episode.id);
    const historyListId = this.#getHistoryListIdFromParams(params);

    await this.historyEntryRepository.createOneBySuperId(historyListId, newEntry);

    await this.episodeRepository.patchOneByIdAndGet(episode.id, {
      entity: {
        lastTimePlayed: newEntry.date.timestamp,
      },
    } );
  }

  async addEpisodesToHistory(
    { episodes, historyListId }: {episodes: EpisodeEntity[];
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
        entity: {
          lastTimePlayed: lastTimeHistoryEntry?.date.timestamp,
        },
      } );
    }
  }
}
