import { EpisodeRepository } from "#modules/episodes";
import { SerieRepository } from "#modules/series";
import { assertFound } from "#utils/http/validation";
import { Request, Response, Router } from "express";
import Service from "./Service";

type Params = {
  serieRepository: SerieRepository;
  episodeRepository: EpisodeRepository;
  playService: Service;
};
export default class PlaySerieController {
  #serieRepository: SerieRepository;

  #episodeRepository: EpisodeRepository;

  #playService: Service;

  constructor( {serieRepository, playService, episodeRepository}: Params) {
    this.#serieRepository = serieRepository;
    this.#episodeRepository = episodeRepository;
    this.#playService = playService;
  }

  async playSerie(req: Request, res: Response) {
    const forceStr = req.query.force;
    const force = !!forceStr;
    const { id: episodeId, name: serieId } = req.params;
    const serieWithEpisodes = await this.#serieRepository.getOneById(serieId);

    assertFound(serieWithEpisodes);

    const episodes = await this.#episodeRepository.getManyBySerieId(serieId);
    const episode = episodes.find((e) => e.episodeId === episodeId);

    if (episode) {
      await this.#playService.play( {
        episodes: [episode],
        force,
      } );
    }

    res.send(episode);
  }

  getRouter(): Router {
    const router = Router();

    router.get("/:name/:id", this.playSerie.bind(this));

    return router;
  }
}