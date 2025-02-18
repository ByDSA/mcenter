import { Request, Response, Router } from "express";
import { UpdateRemoteTreeService } from "../services";
import { SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";

const DEPS_MAP = {
  updateRemoteTreeService: UpdateRemoteTreeService,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class MusicUpdateRemoteController {
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
