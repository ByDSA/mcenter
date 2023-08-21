/* eslint-disable class-methods-use-this */
import { History } from "#modules/history";
import { Episode, EpisodeRepository } from "#modules/series/episode";
import { copyOfEpisode } from "#modules/series/episode/model/episode.entity";
import { SerieRepository } from "#modules/series/serie";
import { Stream, StreamRepository } from "#modules/stream";
import { Repository } from "#modules/utils/base/repository";
import { getDateNow } from "#modules/utils/time/date-type";

type HistoryParams = {
  stream: Stream;
};

type HistoryAndEpisodeParams = {
  history: HistoryParams;
  episode: Episode;
};

type Params = {
  episodeRepository: EpisodeRepository;
};

export default class HistoryRepository implements Repository {
  #episodeRepository: EpisodeRepository;

  #streamRepository: StreamRepository;

  constructor( {episodeRepository}: Params) {
    this.#episodeRepository = episodeRepository;

    const serieRepository = new SerieRepository();

    this.#streamRepository = new StreamRepository( {
      serieRepository,
    } );
  }

  // eslint-disable-next-line require-await
  async findByStream(stream: Stream) {
    return stream.history;
  }

  // eslint-disable-next-line require-await
  async findLastHistoryEntryForEpisode( {history, episode}: HistoryAndEpisodeParams): Promise<History | null> {
    const {stream} = history;
    const {history: streamHistory} = stream;
    const historyEntry = streamHistory.findLast((h) => h.episodeId === episode.id);

    if (!historyEntry)
      return null;

    return historyEntry;
  }

  // TODO: independizar de stream, que no esté dentro, sino aparte (si no, en cada GET/UPDATE tiene que usarse todo el historial)
  async addEpisodeToHistory( {history, episode}: HistoryAndEpisodeParams) {
    console.log("Añadiendo al historial ...");
    const newEntry: History = {
      date: getDateNow(),
      episodeId: episode.id,
    };
    const {stream} = history;

    stream.history.push(newEntry);
    await this.#streamRepository.updateOneById(stream.id, stream);

    const episodeCopy = copyOfEpisode(episode);

    episodeCopy.lastTimePlayed = newEntry.date.timestamp;

    await this.#episodeRepository.updateOne( {
      episode: episodeCopy,
      serieId: stream.id,
    } );
  }

  async removeLastTimeEpisodeFromHistory( {history, episode}: HistoryAndEpisodeParams) {
    console.log("Eliminando del historial ...");

    const {stream} = history;
    const {history: streamHistory} = stream;
    const historyEntryIndex = streamHistory.findLastIndex((h) => h.episodeId === episode.id);

    if (historyEntryIndex === -1)
      return;

    const deletedHistoryEntry = streamHistory[historyEntryIndex];

    streamHistory.splice(historyEntryIndex, 1);

    await this.#streamRepository.updateOneById(stream.id, stream);

    if (deletedHistoryEntry.date.timestamp === episode.lastTimePlayed) {
      const episodeCopy = copyOfEpisode(episode);
      const lastTimeHistoryEntry = await this.findLastHistoryEntryForEpisode( {
        history,
        episode,
      } );

      if (!lastTimeHistoryEntry)
        episodeCopy.lastTimePlayed = undefined;
      else
        episodeCopy.lastTimePlayed = lastTimeHistoryEntry.date.timestamp;

      await this.#episodeRepository.updateOne( {
        episode: episodeCopy,
        serieId: stream.id,
      } );
    }
  }
}