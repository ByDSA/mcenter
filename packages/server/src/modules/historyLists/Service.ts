import { Repository as EpisodeRepository } from "#modules/episodes/repositories";
import { Episode, EpisodeId, compareEpisodeId } from "#shared/models/episodes";
import { assertFound } from "#shared/utils/http/validation";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Entry, Model, ModelId, createHistoryEntryByEpisodeFullId as createHistoryEntryByEpisodeId } from "./models";
import { EntryRepository, ListRepository } from "./repositories";

type HistoryAndEpisodeParams = ( {
  episode: Episode;
} | {
  episodeFullId: EpisodeId;
} ) & ( {
  historyList: Model;
} | {
  historyListId: ModelId;
} );

const DepsMap = {
  episodeRepository: EpisodeRepository,
  historyListRepository: ListRepository,
  historyEntryRepository: EntryRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class Service {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async #getHistoryListFromParams(params: HistoryAndEpisodeParams): Promise<Model> {
    let historyList: Model;

    if ("historyList" in params)
      historyList = params.historyList;
    else if ("historyListId" in params) {
      const got = await this.#deps.historyListRepository.getOneByIdOrCreate(params.historyListId);

      assertFound(got);

      historyList = got;
    } else
      throw new Error("No se ha especificado el historyList");

    return historyList;
  }

  #getHistoryListIdFromParams(params: HistoryAndEpisodeParams): ModelId {
    let historyListId: ModelId;

    if ("historyList" in params)
      historyListId = params.historyList.id;
    else if ("historyListId" in params)
      historyListId = params.historyListId;
    else
      throw new Error("No se ha especificado el historyList");

    return historyListId;
  }

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
      const got = await this.#deps.episodeRepository.getOneById(params.episodeFullId);

      assertFound(got);

      episode = got;
    } else
      throw new Error("No se ha especificado el episodio");

    return episode;
  }

  async findLastHistoryEntryForEpisodeId(params: HistoryAndEpisodeParams): Promise<Entry | null> {
    const episodeFullId: EpisodeId = await this.#getEpisodeIdFromParams(params);
    const historyList: Model = await this.#getHistoryListFromParams(params);
    const historyEntry = historyList.entries.findLast((h) => compareEpisodeId(h.episodeId, episodeFullId));

    if (!historyEntry)
      return null;

    return historyEntry;
  }

  async addEpisodeToHistory(params: HistoryAndEpisodeParams) {
    console.log("Añadiendo al historial ...");

    const episode: Episode = await this.#getEpisodeFromParams(params);
    const newEntry: Entry = createHistoryEntryByEpisodeId(episode.id);
    const historyListId = this.#getHistoryListIdFromParams(params);

    await this.#deps.historyEntryRepository.createOneBySuperId(historyListId, newEntry);

    await this.#deps.episodeRepository.patchOneByIdAndGet(episode.id, {
      lastTimePlayed: newEntry.date.timestamp,
    } );
  }

  async addEpisodesToHistory( {episodes, historyListId}: {episodes: Episode[]; historyListId: ModelId} ) {
    // TODO: usar bulk insert (quitar await en for)
    for (const episode of episodes) {
      await this.addEpisodeToHistory( {
        episode,
        historyListId,
      } );
    }
  }

  async removeLastTimeEpisodeFromHistory(params: HistoryAndEpisodeParams) {
    console.log("Eliminando del historial ...");

    const historyList = await this.#getHistoryListFromParams(params);
    const episodeFullId: EpisodeId = await this.#getEpisodeIdFromParams(params);
    const historyEntryIndex = historyList.entries.findLastIndex((h: Entry) => compareEpisodeId(h.episodeId, episodeFullId));

    if (historyEntryIndex === -1)
      return;

    const deletedHistoryEntry = historyList.entries[historyEntryIndex];

    historyList.entries.splice(historyEntryIndex, 1);

    await this.#deps.historyListRepository.updateOneById(historyList.id, historyList);

    const episode: Episode = await this.#getEpisodeFromParams(params);

    if (deletedHistoryEntry.date.timestamp === episode.lastTimePlayed) {
      const lastTimeHistoryEntry = await this.findLastHistoryEntryForEpisodeId( {
        historyList,
        episodeFullId,
      } );

      await this.#deps.episodeRepository.patchOneByIdAndGet(episodeFullId, {
        lastTimePlayed: lastTimeHistoryEntry?.date.timestamp,
      } );
    }
  }
}