import { SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Request, Response, Router } from "express";
import { UpdateRemoteTreeService } from "../services";

const DepsMap = {
  updateRemoteTreeService: UpdateRemoteTreeService,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class UpdateRemoteController {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async all(_: Request, res: Response) {
    const ret = await this.#deps.updateRemoteTreeService.update();

    res.send(ret);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/", this.all.bind(this));

    return router;
  }
}
