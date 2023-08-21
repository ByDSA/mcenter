import { Stream } from "#modules/stream";
import { Episode, EpisodeRepository } from "../episode";
import { SerieRepository } from "./model";

type Params = {
  episodeRepository: EpisodeRepository;
  serieRepository: SerieRepository;
};
export default class SerieService {
  #episodeRepository: EpisodeRepository;

  #serieRepository: SerieRepository;

  constructor( {episodeRepository, serieRepository}: Params) {
    this.#episodeRepository = episodeRepository;
    this.#serieRepository = serieRepository;
  }

  async findLastEpisodeInStream(stream: Stream): Promise<Episode | null> {
    const episodeId = stream.history.at(-1)?.episodeId;

    if (!episodeId)
      return null;

    const serie = await this.#serieRepository.findOneFromGroupId(stream.group);

    if (!serie)
      return null;

    return this.#episodeRepository.getOneById(episodeId);
  }
}