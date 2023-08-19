/* eslint-disable class-methods-use-this */
import { HistoryRepository } from "#modules/history";
import { SerieRepository } from "#modules/series/serie";
import { StreamRepository } from "#modules/stream";
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

    const episode = episodes.find((e) => e.id === id);
    const streamRepo = StreamRepository.getInstance<StreamRepository>();

    streamRepo.findOneById(name)
      .then((stream) => {
        if (stream && episode)
          HistoryRepository.getInstance<HistoryRepository>().addToHistory(stream, episode);
      } );

    if (episode){
      this.#service.play([episode], {
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