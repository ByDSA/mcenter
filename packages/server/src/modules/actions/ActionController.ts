import { AddNewFilesController } from "#modules/episodes/file-info/add-new-files";
import { UpdateController } from "#modules/episodes/file-info/update";
import { assertIsDefined } from "#shared/utils/validation";
import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Request, Response, Router } from "express";
import fs from "fs";
import path from "path";
import EpisodesUpdateLastTimePlayedController from "./EpisodesUpdateLastTimePlayedController";
import FixerController from "./FixerController";

const DepsMap = {
  episodesUpdateLastTimePlayedController: EpisodesUpdateLastTimePlayedController,
  episodesUpdateFileInfoController: UpdateController,
  episodesAddNewFilesController: AddNewFilesController,
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