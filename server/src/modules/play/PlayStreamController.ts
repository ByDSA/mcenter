/* eslint-disable no-await-in-loop */
import EpisodePickerService from "#modules/episodes/EpisodePicker/EpisodePickerService";
import { HistoryListService } from "#modules/historyLists";
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
  historyListService: HistoryListService;
};
export default class PlayController implements Controller{
  #streamRepository: StreamRepository;

  #episodePickerService: EpisodePickerService;

  #playService: PlayService;

  #historyListService: HistoryListService;

  constructor( {streamRepository, episodePickerService, playService: service, historyListService}: Params) {
    this.#playService = service;
    this.#streamRepository = streamRepository;
    this.#episodePickerService = episodePickerService;
    this.#historyListService = historyListService;
  }

  async playStream(req: Request, res: Response) {
    console.log("playStream");
    const { id, number, force } = validateParams(req);
    const stream = await this.#streamRepository.getOneById(id);

    assertFound(stream);

    const episodes = await this.#episodePickerService.getByStream(stream, number);
    const ok = await this.#playService.play( {
      episodes,
      force,
    } );

    if (ok) {
      await this.#historyListService.addEpisodesToHistory( {
        historyListId: stream.id,
        episodes,
      } );
    } else
      console.log("PlayService: Could not play");

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