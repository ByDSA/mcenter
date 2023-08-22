import { StreamWithHistoryList } from "#modules/streamWithHistoryList";
import { Episode, EpisodeRepository } from "../episode";
import { SerieWithEpisodesRepository } from "./model";

type Params = {
  episodeRepository: EpisodeRepository;
  serieRepository: SerieWithEpisodesRepository;
};
export default class SerieService {
  #episodeRepository: EpisodeRepository;

  #serieRepository: SerieWithEpisodesRepository;

  constructor( {episodeRepository, serieRepository}: Params) {
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