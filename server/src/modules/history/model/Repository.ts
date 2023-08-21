import { EpisodeRepository } from "#modules/series/episode";
import { SerieRepository } from "#modules/series/serie";
import { Stream, StreamRepository } from "#modules/stream";
import { assertFound } from "#utils/checking";
import { CanUpdateOneById } from "#utils/layers/repository";
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
    const stream = await this.#streamRepository.getOneById(streamId);

    assertFound(stream);
    stream.history = list.entries;

    await this.#streamRepository.updateOneById(streamId, stream);
  }

  async findByStream(stream: Stream): Promise<HistoryList> {
    return {
      id: stream.id,
      entries: stream.history,
    };
  }
}