import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Router } from "express";
import { HistoryRestController } from "../history";
import FixController from "./FixController";
import GetController from "./GetController";
import RestController from "./RestController";
import UpdateRemoteController from "./UpdateRemoteController";

const DepsMap = {
  getController: GetController,
  fixController: FixController,
  updateRemoteController: UpdateRemoteController,
  historyController: HistoryRestController,
  restController: RestController,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class ApiController implements Controller {
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
