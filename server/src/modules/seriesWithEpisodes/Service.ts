import { Episode, EpisodeRepository } from "#modules/episodes";
import { StreamWithHistoryList } from "#modules/streamsWithHistoryList";
import { Repository } from "./repositories";

type Params = {
  episodeRepository: EpisodeRepository;
  serieWithEpisodesRepository: Repository;
};
export default class Service {
  #episodeRepository: EpisodeRepository;

  #serieRepository: Repository;

  constructor( {episodeRepository, serieWithEpisodesRepository: serieRepository}: Params) {
    this.#episodeRepository = episodeRepository;
    this.#serieRepository = serieRepository;
  }

  async findLastEpisodeInStreamWithHistoryList(streamWithHistoryList: StreamWithHistoryList): Promise<Episode | null> {
    const episodeId = streamWithHistoryList.history.at(-1)?.episodeId;

    if (!episodeId)
      return null;

    const serie = await this.#serieRepository.findOneFromGroupId(streamWithHistoryList.group);

    if (!serie)
      return null;

    return this.#episodeRepository.getOneById( {
      episodeId,
      serieId: serie.id,
    } );
  }
}