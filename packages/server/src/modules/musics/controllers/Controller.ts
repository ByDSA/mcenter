import { Controller, SecureRouter } from "#utils/express";
import { Router } from "express";
import FixController from "./FixController";
import GetController from "./GetController";
import UpdateRemoteController from "./UpdateRemoteController";

type Params = {
  getController: GetController;
  fixController: FixController;
  updateRemoteController: UpdateRemoteController;
};
export default class ApiController implements Controller {
  #params: Params;

  constructor(params: Params) {
    this.#params = params;
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.use("/get", this.#params.getController.getRouter());
    router.use("/update/fix", this.#params.fixController.getRouter());
    router.use("/update/remote", this.#params.updateRemoteController.getRouter());

    return router;
  }
}
