import { Serie, SerieRepository } from "#modules/series/serie";
import { StreamRepository } from "#modules/stream";
import StreamService from "#modules/stream/StreamService";
import { assertFound } from "#utils/http/validation";
import { assertIsDefined } from "#utils/validation";
import { Request, Response, Router } from "express";
import Service from "./Service";

type Params = {
  playService: Service;
  streamService: StreamService;
  streamRepository: StreamRepository;
  serieRepository: SerieRepository;
};
export default class PlayController {
  #streamRepository: StreamRepository;

  #streamService: StreamService;

  #playService: Service;

  #serieRepository: SerieRepository;

  constructor( {streamRepository, streamService, playService: service, serieRepository}: Params) {
    this.#playService = service;
    this.#streamRepository = streamRepository;
    this.#streamService = streamService;
    this.#serieRepository = serieRepository;
  }

  async playStream(req: Request, res: Response) {
    console.log("playStream");
    const { id, number, force } = validateParams(req);
    const stream = await this.#streamRepository.getOneByIdOrCreateFromSerie(id);

    assertFound(stream);

    const episodes = await this.#streamService.pickNextEpisode(stream, number);
    const serieWithEpisodes = await this.#serieRepository.getOneById(stream.id);

    assertFound(serieWithEpisodes);

    const serie: Serie = {
      id: serieWithEpisodes.id,
      name: serieWithEpisodes.name,
    };
    const episodeWithSerie = episodes.map((episode) => ( {
      ...episode,
      serie,
    } ));

    await this.#playService.play( {
      episodes: episodeWithSerie,
      force,
    } );

    res.send(episodes);
  }

  getRouter(): Router {
    const router = Router();

    router.get("/:id/:number?", this.playStream.bind(this));

    return router;
  }
}

function validateParams(req: Request) {
  const forceStr = req.query.force;
  const force = !!forceStr;
  const { id } = req.params;
  const number = +(req.params.number ?? 1);

  assertIsDefined(id);

  return {
    id,
    number,
    force,
  };
}