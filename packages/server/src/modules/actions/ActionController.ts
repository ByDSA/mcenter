import fs from "fs";
import path from "path";
import { Router } from "express";
import { assertIsDefined } from "#shared/utils/validation";
import { Get } from "@nestjs/common";
import { Controller, SecureRouter } from "#utils/express";
import { EpisodeAddNewFilesController, EpisodeUpdateController } from "#episodes/index";
import { FixerController } from "./FixerController";
import { EpisodesUpdateLastTimePlayedController } from "./EpisodesUpdateLastTimePlayedController";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";

const DEPS_MAP = {
  episodesUpdateLastTimePlayedController: EpisodesUpdateLastTimePlayedController,
  episodesUpdateFileInfoController: EpisodeUpdateController,
  episodesAddNewFilesController: EpisodeAddNewFilesController,
  fixerController: FixerController,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class ActionController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  @Get("/log")
  log() {
    try {
      const { TMP_PATH } = process.env;

      assertIsDefined(TMP_PATH);
      const pathFile = path.join(TMP_PATH, ".log");
      const log = fs.readFileSync(pathFile, "utf-8");

      return log;
    } catch {
      return "No log file";
    }
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.use("/episodes/updateLastTimePlayed", this.#deps.episodesUpdateLastTimePlayedController.getRouter());
    router.use("/episodes/file-info/update", this.#deps.episodesUpdateFileInfoController.getRouter());
    router.use("/episodes/add-new-files", this.#deps.episodesAddNewFilesController.getRouter());
    router.use("/fixer", this.#deps.fixerController.getRouter());

    return router;
  }
}
