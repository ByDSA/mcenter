import { SerieWithEpisodesRepository } from "#modules/seriesWithEpisodes";
import { assertFound } from "#utils/http/validation";
import { assertIsNotEmpty } from "#utils/validation";
import { Request, Response, Router } from "express";
import Service from "./Service";

type Params = {
  serieRepository: SerieWithEpisodesRepository;
  playService: Service;
};
export default class PlaySerieController {
  #serieRepository: SerieWithEpisodesRepository;

  #playService: Service;

  constructor( {serieRepository, playService}: Params) {
    this.#serieRepository = serieRepository;
    this.#playService = playService;
  }

  async playSerie(req: Request, res: Response) {
    const forceStr = req.query.force;
    const force = !!forceStr;
    const { id: episodeId, name: serieId } = req.params;
    const serieWithEpisodes = await this.#serieRepository.getOneById(serieId);

    assertFound(serieWithEpisodes);

    const { episodes } = serieWithEpisodes;

    assertIsNotEmpty(episodes);

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