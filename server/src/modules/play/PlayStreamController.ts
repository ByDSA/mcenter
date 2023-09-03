import EpisodePickerService from "#modules/episodes/EpisodePicker/EpisodePickerService";
import { StreamRepository } from "#modules/streams";
import { Controller } from "#utils/express";
import { assertFound } from "#utils/http/validation";
import { assertIsDefined } from "#utils/validation";
import { Request, Response, Router } from "express";
import PlayService from "./PlayService";

type Params = {
  playService: PlayService;
  episodePickerService: EpisodePickerService;
  streamRepository: StreamRepository;
};
export default class PlayController implements Controller{
  #streamRepository: StreamRepository;

  #episodePickerService: EpisodePickerService;

  #playService: PlayService;

  constructor( {streamRepository, episodePickerService, playService: service}: Params) {
    this.#playService = service;
    this.#streamRepository = streamRepository;
    this.#episodePickerService = episodePickerService;
  }

  async playStream(req: Request, res: Response) {
    console.log("playStream");
    const { id, number, force } = validateParams(req);
    const stream = await this.#streamRepository.getOneById(id);

    assertFound(stream);

    const episodes = await this.#episodePickerService.getByStream(stream, number);

    await this.#playService.play( {
      episodes,
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