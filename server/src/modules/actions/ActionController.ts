import { Controller, SecureRouter } from "#utils/express";
import { Router } from "express";
import EpisodesUpdateLastTimePlayedController from "./EpisodesUpdateLastTimePlayedController";

type Params = {
  episodesUpdateLastTimePlayedController: EpisodesUpdateLastTimePlayedController;
};
export default class ActionController implements Controller {
  #episodesUpdateLastTimePlayedController: EpisodesUpdateLastTimePlayedController;

  constructor( {episodesUpdateLastTimePlayedController: episodesUpdateLastTimePlayed}: Params) {
    this.#episodesUpdateLastTimePlayedController = episodesUpdateLastTimePlayed;
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.use("/episodes/updateLastTimePlayed", this.#episodesUpdateLastTimePlayedController.getRouter());

    return router;
  }
}