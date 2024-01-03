/* eslint-disable no-use-before-define */
import { PublicMethodsOf } from "#shared/utils/types";
import { SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Request, Response, Router } from "express";
import { MusicRepository } from "..";
import { UpdateRemoteTreeService } from "../services/update-remote-tree";

const DepsMap = {
  musicRepository: MusicRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class UpdateRemoteController {
  #musicRepository: PublicMethodsOf<MusicRepository>;

  constructor(deps?: Partial<Deps>) {
    this.#musicRepository = (deps as Deps).musicRepository;
  }

  async all(_: Request, res: Response) {
    const updateRemoteTreeService = new UpdateRemoteTreeService( {
      musicRepository: this.#musicRepository,
    } );
    const ret = await updateRemoteTreeService.update();

    res.send(ret);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/", this.all.bind(this));

    return router;
  }
}
