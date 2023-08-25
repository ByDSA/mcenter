import { EpisodeRepository } from "#modules/episodes";
import { SerieRepository } from "#modules/series";
import { Controller, SecureRouter } from "#utils/express";
import { assertFound } from "#utils/http/validation";
import { Request, Response, Router } from "express";
import PlayService from "./PlayService";

type Params = {
  serieRepository: SerieRepository;
  episodeRepository: EpisodeRepository;
  playService: PlayService;
};
export default class PlaySerieController implements Controller {
  #serieRepository: SerieRepository;

  #episodeRepository: EpisodeRepository;

  #playService: PlayService;

  constructor( {serieRepository, playService, episodeRepository}: Params) {
    this.#serieRepository = serieRepository;
    this.#episodeRepository = episodeRepository;
    this.#playService = playService;
  }

  async playSerie(req: Request, res: Response) {
    const forceStr = req.query.force;
    const force = !!forceStr;
    const { id: episodeId, name: serieId } = req.params;
    const serie = await this.#serieRepository.getOneById(serieId);

    assertFound(serie);

    const episodes = await this.#episodeRepository.getManyBySerieId(serieId);
    const episode = episodes.find((e) => e.episodeId === episodeId);

    assertFound(episode);
    await this.#playService.play( {
      episodes: [episode],
      force,
    } );

    res.send(episode);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/:name/:id", this.playSerie.bind(this));

    return router;
  }
}