import { StreamWithHistoryList } from "#modules/streamsWithHistoryList";
import { Episode, EpisodeRepository } from "../episodes";
import { Repository } from "./repositories";

type Params = {
  episodeRepository: EpisodeRepository;
  serieRepository: Repository;
};
export default class SerieService {
  #episodeRepository: EpisodeRepository;

  #serieRepository: Repository;

  constructor( {episodeRepository, serieRepository}: Params) {
    this.#episodeRepository = episodeRepository;
    this.#serieRepository = serieRepository;
  }

  async findLastEpisodeInStreamWithHistoryList(streamWithHistoryList: StreamWithHistoryList): Promise<Episode | null> {
    const episodeId = streamWithHistoryList.history.at(-1)?.id;

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