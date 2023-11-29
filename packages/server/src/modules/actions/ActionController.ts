import { EpisodeAddNewFileInfosController, EpisodeUpdateFileInfoController } from "#modules/episodes";
import { assertIsDefined } from "#shared/utils/validation";
import { Controller, SecureRouter } from "#utils/express";
import { Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
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

    router.get("/log", (req: Request, res: Response) => {
      try {
        const { TMP_PATH } = process.env;

        assertIsDefined(TMP_PATH);
        const pathFile = path.join(TMP_PATH, ".log");
        const log = fs.readFileSync(pathFile, "utf-8");

        res.send(log);
      } catch (e) {
        res.send("No log file");
      }
    } );

    return router;
  }
}