/* eslint-disable class-methods-use-this */
import { History } from "#modules/history";
import { Episode, EpisodeRepository } from "#modules/series/episode";
import { copyOfEpisode } from "#modules/series/episode/model/episode.entity";
import { Stream, StreamRepository } from "#modules/stream";
import { Repository } from "#modules/utils/base/repository";
import { getDateNow } from "#modules/utils/time/date-type";

export default class HistoryRepository extends Repository {
  // eslint-disable-next-line require-await
  async findByStream(stream: Stream) {
    return stream.history;
  }

  // TODO: independizar de stream, que no esté dentro, sino aparte (si no, en cada GET/UPDATE tiene que usarse todo el historial)
  async addToHistory(stream: Stream, episode: Episode) {
    console.log("Añadiendo al historial ...");
    const newEntry: History = {
      date: getDateNow(),
      episodeId: episode.id,
    };

    stream.history.push(newEntry);
    await StreamRepository.getInstance<StreamRepository>().updateOneById(stream.id, stream);

    const episodeCopy = copyOfEpisode(episode);

    episodeCopy.lastTimePlayed = newEntry.date.timestamp;

    await EpisodeRepository.getInstance<EpisodeRepository>().updateOne( {
      episode: episodeCopy,
      serieId: stream.id,
    } );
  }
}