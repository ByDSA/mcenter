
import { Controller, SecureRouter } from "#utils/express";
import { Request, Response, Router } from "express";
import { VlcBackWebSocketsServerService } from "./vlc-back-service";

type Params = {
  remotePlayerService: VlcBackWebSocketsServerService;
};
export default class RemotePlayerController implements Controller {
  #vlcBackService: VlcBackWebSocketsServerService;

  constructor( {remotePlayerService}: Params) {
    this.#vlcBackService = remotePlayerService;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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