/* eslint-disable class-methods-use-this */
import { EpisodeWithSerie } from "#modules/series";
import { copyOfEpisode } from "#modules/series/episode/model/episode.entity";
import { Serie, SerieRepository } from "#modules/series/serie";
import { assertFound, assertHasItems } from "#modules/utils/base/http/asserts";
import { Request, Response, Router } from "express";
import Service from "./Service";

type Params = {
  serieRepository: SerieRepository;
  service: Service;
};
export default class PlayController {
  #serieRepository: SerieRepository;

  #service: Service;

  constructor( {serieRepository, service}: Params) {
    this.#serieRepository = serieRepository;
    this.#service = service;
  }

  // eslint-disable-next-line require-await
  async root(req: Request, res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, type, force } = this.#getParams(req, res);
  }

  async playSerieFunc(req: Request, res: Response) {
    const forceStr = req.query.force;
    const force = !!forceStr;
    const { id, name } = req.params;
    const serie = await this.#serieRepository.findOneById(name);

    assertFound(serie);

    const { episodes } = serie;

    assertHasItems(episodes);

    const episode = episodes.find((e) => e.innerId === id);

    if (episode) {
      const serieWithoutEpisodes: Serie = {
        id: serie.id,
        name: serie.name,
      };
      const episodeWithSerie: EpisodeWithSerie = {
        ...copyOfEpisode(episode),
        serie: serieWithoutEpisodes,
      };

      await this.#service.play( {
        episodes: [episodeWithSerie],
        force,
      } );
    }

    res.send(episode);
  }

  #getParams(req: Request, res: Response) {
    const forceStr = req.query.force;
    const force = !!forceStr;
    const { id, type } = req.params;

    if (!id || !type) {
      res.status(400);
      res.send("No ID nor TYPE.");
      res.end();
    }

    switch (type) {
      case "serie":
      case "peli":
        break;
      default:
        res.status(400);
        res.send(`Type '${type}' is invalid.`);
        res.end();
    }

    return {
      id,
      type,
      force,
    };
  }

  getRouter(): Router {
    const router = Router();

    router.get("/serie/:name/:id", this.playSerieFunc.bind(this));
    router.get("/:type/:id", this.root.bind(this));

    return router;
  }
}