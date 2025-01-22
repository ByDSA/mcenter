import { PublicMethodsOf } from "#shared/utils/types";
import { Request, Response, Router } from "express";
import { VlcBackWebSocketsServerService } from "./vlc-back";
import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";

const DepsMap = {
  remotePlayerService: VlcBackWebSocketsServerService,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class RemotePlayerController implements Controller {
  #vlcBackService: PublicMethodsOf<VlcBackWebSocketsServerService>;

  constructor(deps?: Partial<Deps>) {
    this.#vlcBackService = (deps as Deps).remotePlayerService;
  }

  async getStatus(_: Request, _res: Response) {
    throw new Error("Not implemented");

    // res.send(status);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/status", this.getStatus.bind(this));

    return router;
  }
}
