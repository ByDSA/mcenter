/* eslint-disable class-methods-use-this */
import { EpisodeRepository } from "#modules/series/episode";
import { SerieRepository } from "#modules/series/serie";
import { Stream, StreamRepository } from "#modules/stream";
import { assertFound } from "#modules/utils/base/http/asserts";
import { CanUpdateOneById } from "#modules/utils/base/repository";
import HistoryList, { HistoryListId } from "./HistoryList";

type Params = {
  episodeRepository: EpisodeRepository;
};

export default class HistoryRepository
implements CanUpdateOneById<HistoryList, HistoryListId> {
  #episodeRepository: EpisodeRepository;

  #streamRepository: StreamRepository;

  constructor( {episodeRepository}: Params) {
    this.#episodeRepository = episodeRepository;

    const serieRepository = new SerieRepository();

    this.#streamRepository = new StreamRepository( {
      serieRepository,
    } );
  }

  async updateOneById(id: HistoryListId, list: HistoryList): Promise<void> {
    const streamId = id;
    const stream = await this.#streamRepository.findOneById(streamId);

    assertFound(stream);
    stream.history = list.entries;

    await this.#streamRepository.updateOneById(streamId, stream);
  }

  // eslint-disable-next-line require-await
  async findByStream(stream: Stream): Promise<HistoryList> {
    return {
      id: stream.id,
      entries: stream.history,
    };
  }
}