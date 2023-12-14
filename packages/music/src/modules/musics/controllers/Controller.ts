import { Router } from "express";
import FixController from "./FixController";
import GetController from "./GetController";

type Params = {
  getController: GetController;
  fixController: FixController;
};
export default class ApiController {
  #getController: GetController;

  #fixController: FixController;

  constructor( { fixController,getController }: Params) {
    this.#fixController = fixController;

    this.#getController = getController;
  }

  getRouter(): Router {
    const router = Router(); // TODO: cambiar por SecureRouter

    router.use("/get", this.#getController.getRouter());
    router.use("/update/fix", this.#fixController.getRouter());

    return router;
  }
}
