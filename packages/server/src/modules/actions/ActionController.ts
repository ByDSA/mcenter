import fs from "fs";
import path from "path";
import { Request, Response, Router } from "express";
import { assertIsDefined } from "#shared/utils/validation";
import EpisodesUpdateLastTimePlayedController from "./EpisodesUpdateLastTimePlayedController";
import FixerController from "./FixerController";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Controller, SecureRouter } from "#utils/express";
import { EpisodeAddNewFilesController, EpisodeUpdateController } from "#modules/episodes";

const DepsMap = {
  episodesUpdateLastTimePlayedController: EpisodesUpdateLastTimePlayedController,
  episodesUpdateFileInfoController: EpisodeUpdateController,
  episodesAddNewFilesController: EpisodeAddNewFilesController,
  fixerController: FixerController,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class ActionController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.use("/episodes/updateLastTimePlayed", this.#deps.episodesUpdateLastTimePlayedController.getRouter());
    router.use("/episodes/file-info/update", this.#deps.episodesUpdateFileInfoController.getRouter());
    router.use("/episodes/add-new-files", this.#deps.episodesAddNewFilesController.getRouter());
    router.use("/fixer", this.#deps.fixerController.getRouter());

    router.get("/log", (_req: Request, res: Response) => {
      try {
        const { TMP_PATH } = process.env;

        assertIsDefined(TMP_PATH);
        const pathFile = path.join(TMP_PATH, ".log");
        const log = fs.readFileSync(pathFile, "utf-8");

        res.send(log);
      } catch {
        res.send("No log file");
      }
    } );

    return router;
  }
}
