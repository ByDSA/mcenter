import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Router } from "express";
import FixController from "./FixController";
import GetController from "./GetController";
import UpdateRemoteController from "./UpdateRemoteController";

const DepsMap = {
  getController: GetController,
  fixController: FixController,
  updateRemoteController: UpdateRemoteController,
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

    router.use("/get", this.#deps.getController.getRouter());
    router.use("/update/fix", this.#deps.fixController.getRouter());
    router.use("/update/remote", this.#deps.updateRemoteController.getRouter());

    return router;
  }
}
