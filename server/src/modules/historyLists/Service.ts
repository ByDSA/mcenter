import { Episode, EpisodeFullId, EpisodeRepository, compareEpisodeFullId } from "#modules/episodes";
import { assertFound } from "#shared/utils/http/validation";
import { Entry, Model, ModelId, createHistoryEntryByEpisodeFullId } from "./models";
import { ListRepository } from "./repositories";
import EntryRepository from "./repositories/EntryRepository";

type HistoryAndEpisodeParams = ( {
  episode: Episode;
} | {
  episodeFullId: EpisodeFullId;
} ) & ( {
  historyList: Model;
} | {
  historyListId: ModelId;
} );

type Params = {
  episodeRepository: EpisodeRepository;
  historyListRepository: ListRepository;
  historyEntryRepository: EntryRepository;
};

export default class Service {
  #listRepository: ListRepository;

  #episodeRepository: EpisodeRepository;

  #entryRepository: EntryRepository;

  constructor( {historyListRepository: historyRepository, episodeRepository,historyEntryRepository}: Params) {
    this.#listRepository = historyRepository;
    this.#episodeRepository = episodeRepository;
    this.#entryRepository = historyEntryRepository;
  }

  async #getHistoryListFromParams(params: HistoryAndEpisodeParams): Promise<Model> {
    let historyList: Model;

    if ("historyList" in params)
      historyList = params.historyList;
    else if ("historyListId" in params) {
      const got = await this.#listRepository.getOneByIdOrCreate(params.historyListId);

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

  async #getEpisodeFullIdFromParams(params: HistoryAndEpisodeParams): Promise<EpisodeFullId> {
    let episodeFullId: EpisodeFullId;

    if ("episode" in params)
      episodeFullId = params.episode;
    else if ("episodeFullId" in params)
      episodeFullId = params.episodeFullId;
    else
      throw new Error("No se ha especificado el episodio");

    return episodeFullId;
  }

  async #getEpisodeFromParams(params: HistoryAndEpisodeParams): Promise<Episode> {
    let episode: Episode;

    if ("episode" in params)
      episode = params.episode;
    else if ("episodeFullId" in params) {
      const got = await this.#episodeRepository.getOneById(params.episodeFullId);

      assertFound(got);

      episode = got;
    } else
      throw new Error("No se ha especificado el episodio");

    return episode;
  }

  async findLastHistoryEntryForEpisodeId(params: HistoryAndEpisodeParams): Promise<Entry | null> {
    const episodeFullId: EpisodeFullId = await this.#getEpisodeFullIdFromParams(params);
    const historyList: Model = await this.#getHistoryListFromParams(params);
    const historyEntry = historyList.entries.findLast((h) => compareEpisodeFullId(h, episodeFullId));

    if (!historyEntry)
      return null;

    return historyEntry;
  }

  async addEpisodeToHistory(params: HistoryAndEpisodeParams) {
    console.log("Añadiendo al historial ...");

    const episode: Episode = await this.#getEpisodeFromParams(params);
    const newEntry: Entry = createHistoryEntryByEpisodeFullId(episode);
    const historyListId = this.#getHistoryListIdFromParams(params);

    await this.#entryRepository.createOneBySuperId(historyListId, newEntry);

    await this.#episodeRepository.patchOneByIdAndGet(episode, {
      lastTimePlayed: newEntry.date.timestamp,
    } );
  }

  async addEpisodesToHistory( {episodes, historyListId}: {episodes: Episode[]; historyListId: ModelId} ) {
    for (const episode of episodes) {
      // eslint-disable-next-line no-await-in-loop
      await this.addEpisodeToHistory( {
        episode,
        historyListId,
      } );
    }
  }

  async removeLastTimeEpisodeFromHistory(params: HistoryAndEpisodeParams) {
    console.log("Eliminando del historial ...");

    const historyList = await this.#getHistoryListFromParams(params);
    const episodeFullId: EpisodeFullId = await this.#getEpisodeFullIdFromParams(params);
    const historyEntryIndex = historyList.entries.findLastIndex((h: Entry) => compareEpisodeFullId(h, episodeFullId));

    if (historyEntryIndex === -1)
      return;

    const deletedHistoryEntry = historyList.entries[historyEntryIndex];

    historyList.entries.splice(historyEntryIndex, 1);

    await this.#listRepository.updateOneById(historyList.id, historyList);

    const episode: Episode = await this.#getEpisodeFromParams(params);

    if (deletedHistoryEntry.date.timestamp === episode.lastTimePlayed) {
      const lastTimeHistoryEntry = await this.findLastHistoryEntryForEpisodeId( {
        historyList,
        episodeFullId,
      } );

      await this.#episodeRepository.patchOneByIdAndGet(episodeFullId, {
        lastTimePlayed: lastTimeHistoryEntry?.date.timestamp,
      } );
    }
  }
}