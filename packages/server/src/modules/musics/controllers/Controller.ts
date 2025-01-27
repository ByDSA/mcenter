import { Router } from "express";
import { MusicHistoryRestController } from "../history";
import { MusicFixController } from "./FixController";
import { MusicGetController } from "./GetController";
import { MusicRestController } from "./RestController";
import { MusicUpdateRemoteController } from "./UpdateRemoteController";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Controller, SecureRouter } from "#utils/express";

const DEPS_MAP = {
  getController: MusicGetController,
  fixController: MusicFixController,
  updateRemoteController: MusicUpdateRemoteController,
  historyController: MusicHistoryRestController,
  restController: MusicRestController,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class MusicController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.use("/", this.#deps.restController.getRouter());

    router.use("/get", this.#deps.getController.getRouter());
    router.use("/update/fix", this.#deps.fixController.getRouter());

    // Debug: http://localhost:8011/api/musics/update/remote
    router.use("/update/remote", this.#deps.updateRemoteController.getRouter());

    router.use("/history", this.#deps.historyController.getRouter());

    return router;
  }
}
