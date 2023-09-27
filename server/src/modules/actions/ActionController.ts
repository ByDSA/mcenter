import { EpisodeAddNewFileInfosController, EpisodeUpdateFileInfoController } from "#modules/episodes";
import { Controller, SecureRouter } from "#utils/express";
import { Router } from "express";
import EpisodesUpdateLastTimePlayedController from "./EpisodesUpdateLastTimePlayedController";
import FixerController from "./FixerController";

type Params = {
  episodesUpdateLastTimePlayedController: EpisodesUpdateLastTimePlayedController;
  episodesUpdateFileInfoController: EpisodeUpdateFileInfoController;
  episodesAddNewFilesController: EpisodeAddNewFileInfosController;
  fixerController: FixerController;
};
export default class ActionController implements Controller {
  #episodesUpdateLastTimePlayedController: EpisodesUpdateLastTimePlayedController;

  #episodesUpdateFileInfoController: EpisodeUpdateFileInfoController;

  #episodesAddNewFilesController: EpisodeAddNewFileInfosController;

  #fixerController: FixerController;

  constructor( {episodesUpdateLastTimePlayedController: episodesUpdateLastTimePlayed, episodesUpdateFileInfoController: episodesFileController, episodesAddNewFilesController, fixerController}: Params) {
    this.#episodesUpdateLastTimePlayedController = episodesUpdateLastTimePlayed;
    this.#episodesUpdateFileInfoController = episodesFileController;
    this.#episodesAddNewFilesController = episodesAddNewFilesController;
    this.#fixerController = fixerController;
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.use("/episodes/updateLastTimePlayed", this.#episodesUpdateLastTimePlayedController.getRouter());
    router.use("/episodes/file-info/update", this.#episodesUpdateFileInfoController.getRouter());
    router.use("/episodes/add-new-files", this.#episodesAddNewFilesController.getRouter());
    router.use("/fixer", this.#fixerController.getRouter());

    return router;
  }
}