import { EpisodeWithSerie } from "#modules/series";
import { copyOfEpisode } from "#modules/series/episode/model";
import { Serie, SerieRepository } from "#modules/series/serie";
import { assertFound } from "#utils/http/validation";
import { assertIsNotEmpty } from "#utils/validation";
import { Request, Response, Router } from "express";
import Service from "./Service";

type Params = {
  serieRepository: SerieRepository;
  playService: Service;
};
export default class PlaySerieController {
  #serieRepository: SerieRepository;

  #playService: Service;

  constructor( {serieRepository, playService}: Params) {
    this.#serieRepository = serieRepository;
    this.#playService = playService;
  }

  async playSerie(req: Request, res: Response) {
    const forceStr = req.query.force;
    const force = !!forceStr;
    const { id, name } = req.params;
    const serie = await this.#serieRepository.getOneById(name);

    assertFound(serie);

    const { episodes } = serie;

    assertIsNotEmpty(episodes);

    const episode = episodes.find((e) => e.id === id);

    if (episode) {
      const serieWithoutEpisodes: Serie = {
        id: serie.id,
        name: serie.name,
      };
      const episodeWithSerie: EpisodeWithSerie = {
        ...copyOfEpisode(episode),
        serie: serieWithoutEpisodes,
      };

      await this.#playService.play( {
        episodes: [episodeWithSerie],
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