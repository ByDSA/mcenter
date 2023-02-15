/* eslint-disable class-methods-use-this */
import { Episode } from "#modules/episode";
import { History } from "#modules/history";
import { Stream, StreamRepository } from "#modules/stream";
import Repository from "#modules/utils/base/Repository";
import { getDateNow } from "#modules/utils/time/date-type";

export default class HistoryRepository extends Repository {
  // TODO: independizar de stream, que no esté dentro, sino aparte (si no, en cada GET/UPDATE tiene que usarse todo el historial)
  async addToHistory(stream: Stream, episode: Episode) {
    const newEntry: History = {
      date: getDateNow(),
      episodeId: episode.id,
    };

    stream.history.push(newEntry);
    await StreamRepository.getInstance<StreamRepository>().updateOneById(stream.id, stream);
  }
}