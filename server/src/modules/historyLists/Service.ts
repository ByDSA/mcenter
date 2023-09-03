import { Episode, EpisodeFullId, EpisodeRepository, compareEpisodeFullId } from "#modules/episodes";
import { assertFound } from "#utils/http/validation";
import { deepCopy } from "#utils/objects";
import { Entry, Model, createHistoryEntryByEpisodeFullId } from "./models";
import { Repository } from "./repositories";

type HistoryAndEpisodeParams = {
  historyList: Model;
} & ( {
  episode: Episode;
} | {
  episodeFullId: EpisodeFullId;
} );

type Params = {
  episodeRepository: EpisodeRepository;
  historyRepository: Repository;
};

export default class Service {
  #historyRepository: Repository;

  #episodeRepository: EpisodeRepository;

  constructor( {historyRepository, episodeRepository}: Params) {
    this.#historyRepository = historyRepository;
    this.#episodeRepository = episodeRepository;
  }

  async findLastHistoryEntryForEpisodeId( {historyList, ...params}: HistoryAndEpisodeParams): Promise<Entry | null> {
    let episodeFullId: EpisodeFullId;

    if ("episode" in params)
      episodeFullId = params.episode;
    else if ("episodeFullId" in params)
      episodeFullId = params.episodeFullId;
    else
      throw new Error("No se ha especificado el episodio");

    // TODO: debería coincidir también la serie. Posteriormente se podrán poner episodios de diferentes series en un mismo historial o stream
    const historyEntry = historyList.entries.findLast((h) => compareEpisodeFullId(h, episodeFullId));

    if (!historyEntry)
      return null;

    return historyEntry;
  }

  async addEpisodeToHistory( {historyList, ...params}: HistoryAndEpisodeParams) {
    console.log("Añadiendo al historial ...");

    let episode: Episode;

    if ("episode" in params)
      episode = params.episode;
    else if ("episodeFullId" in params) {
      const episodeOrNull = await this.#episodeRepository.getOneById(params.episodeFullId);

      assertFound(episodeOrNull);
      episode = episodeOrNull;
    } else
      throw new Error("No se ha especificado el episodio");

    const newEntry: Entry = createHistoryEntryByEpisodeFullId(episode);

    historyList.entries.push(newEntry);
    await this.#historyRepository.updateOneById(historyList.id, historyList);

    const episodeCopy = deepCopy(episode);

    episodeCopy.lastTimePlayed = newEntry.date.timestamp;

    await this.#episodeRepository.updateOneByIdAndGet(episodeCopy, episodeCopy);
    console.log("Añadido al historial!", newEntry);
  }

  async removeLastTimeEpisodeFromHistory( {historyList, ...params}: HistoryAndEpisodeParams) {
    console.log("Eliminando del historial ...");

    let episodeFullId: EpisodeFullId;

    if ("episode" in params)
      episodeFullId = params.episode;

    else if ("episodeFullId" in params)
      episodeFullId = params.episodeFullId;
    else
      throw new Error("No se ha especificado el episodio");

    const historyEntryIndex = historyList.entries.findLastIndex((h: Entry) => compareEpisodeFullId(h, episodeFullId));

    if (historyEntryIndex === -1)
      return;

    const deletedHistoryEntry = historyList.entries[historyEntryIndex];

    historyList.entries.splice(historyEntryIndex, 1);

    await this.#historyRepository.updateOneById(historyList.id, historyList);

    let episode: Episode;

    if ("episode" in params)
      episode = params.episode;
    else {
      const gotEpisode = await this.#episodeRepository.getOneById(episodeFullId);

      assertFound(gotEpisode);
      episode = gotEpisode;
    }

    if (deletedHistoryEntry.date.timestamp === episode.lastTimePlayed) {
      const episodeCopy = deepCopy(episode);
      const lastTimeHistoryEntry = await this.findLastHistoryEntryForEpisodeId( {
        historyList,
        episodeFullId,
      } );

      if (!lastTimeHistoryEntry)
        episodeCopy.lastTimePlayed = undefined;
      else
        episodeCopy.lastTimePlayed = lastTimeHistoryEntry.date.timestamp;

      await this.#episodeRepository.updateOneByIdAndGet(episodeFullId, episodeCopy);
    }
  }
}