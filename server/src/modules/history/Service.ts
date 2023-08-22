import { EpisodeId, EpisodeRepository, SerieId } from "#modules/series";
import { Episode, copyOfEpisode } from "#modules/series/episode/model";
import { EpisodeFullId, episodeFullIdOf } from "#modules/series/episode/model/repository/Episode";
import { assertFound } from "#utils/http/validation";
import { getDateNow } from "src/utils/time/date-type";
import { HistoryEntry, HistoryRepository } from "./model";
import HistoryList from "./model/HistoryList";

type HistoryAndEpisodeParams = {
  historyList: HistoryList;
} & ( {
  episode: Episode;
} | {
  episodeId: EpisodeId;
  serieId: SerieId;
} );

type Params = {
  episodeRepository: EpisodeRepository;
  historyRepository: HistoryRepository;
};

export default class Service {
  #historyRepository: HistoryRepository;

  #episodeRepository: EpisodeRepository;

  constructor( {historyRepository, episodeRepository}: Params) {
    this.#historyRepository = historyRepository;
    this.#episodeRepository = episodeRepository;
  }

  async findLastHistoryEntryForEpisodeId( {historyList, ...params}: HistoryAndEpisodeParams): Promise<HistoryEntry | null> {
    let episodeId: EpisodeId;
    let serieId: SerieId;

    if ("episode" in params) {
      episodeId = params.episode.id;
      serieId = params.episode.serieId;
    } else if ("episodeId" in params) {
      episodeId = params.episodeId;
      serieId = params.serieId;
    } else
      throw new Error("No se ha especificado el episodio");

    // TODO: debería coincidir también la serie. Posteriormente se podrán poner episodios de diferentes series en un mismo historial o stream
    const historyEntry = historyList.entries.findLast((h) => h.episodeId === episodeId && h.serieId === serieId);

    if (!historyEntry)
      return null;

    return historyEntry;
  }

  async addEpisodeToHistory( {historyList, ...params}: HistoryAndEpisodeParams) {
    console.log("Añadiendo al historial ...");

    let fullId: EpisodeFullId;
    let episode: Episode;

    if ("episode" in params) {
      episode = params.episode;
      fullId = episodeFullIdOf(episode);
    } else if ("episodeId" in params) {
      fullId = {
        id: params.episodeId,
        serieId: params.serieId,
      };
      const episodeOrNull = await this.#episodeRepository.getOneById(fullId);

      assertFound(episodeOrNull);
      episode = episodeOrNull;
    } else
      throw new Error("No se ha especificado el episodio");

    const newEntry: HistoryEntry = {
      date: getDateNow(),
      episodeId: fullId.id,
      serieId: fullId.serieId,
    };

    historyList.entries.push(newEntry);
    await this.#historyRepository.updateOneById(historyList.id, historyList);

    const episodeCopy = copyOfEpisode(episode);

    episodeCopy.lastTimePlayed = newEntry.date.timestamp;

    await this.#episodeRepository.updateOneByIdAndGet(fullId, episodeCopy);
  }

  async removeLastTimeEpisodeFromHistory( {historyList, ...params}: HistoryAndEpisodeParams) {
    console.log("Eliminando del historial ...");

    let fullId: EpisodeFullId;

    if ("episode" in params)
      fullId = episodeFullIdOf(params.episode);

    else if ("episodeId" in params){
      fullId = {
        id: params.episodeId,
        serieId: params.serieId,
      };
    } else
      throw new Error("No se ha especificado el episodio");

    const historyEntryIndex = historyList.entries.findLastIndex((h: HistoryEntry) => h.episodeId === fullId.id && h.serieId === fullId.serieId);

    if (historyEntryIndex === -1)
      return;

    const deletedHistoryEntry = historyList.entries[historyEntryIndex];

    historyList.entries.splice(historyEntryIndex, 1);

    await this.#historyRepository.updateOneById(historyList.id, historyList);

    let episode: Episode;

    if ("episode" in params)
      episode = params.episode;
    else {
      const gotEpisode = await this.#episodeRepository.getOneById(fullId);

      assertFound(gotEpisode);
      episode = gotEpisode;
    }

    if (deletedHistoryEntry.date.timestamp === episode.lastTimePlayed) {
      const episodeCopy = copyOfEpisode(episode);
      const lastTimeHistoryEntry = await this.findLastHistoryEntryForEpisodeId( {
        historyList,
        episodeId: fullId.id,
        serieId: fullId.serieId,
      } );

      if (!lastTimeHistoryEntry)
        episodeCopy.lastTimePlayed = undefined;
      else
        episodeCopy.lastTimePlayed = lastTimeHistoryEntry.date.timestamp;

      await this.#episodeRepository.updateOneByIdAndGet(fullId, episodeCopy);
    }
  }
}