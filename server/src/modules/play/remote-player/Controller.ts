
import { Controller, SecureRouter } from "#utils/express";
import { Request, Response, Router } from "express";

import { Service } from "./service";

type Params = {
  remotePlayerService: Service;
};
export default class RemotePlayerController implements Controller {
  #service: Service;

  constructor( {remotePlayerService}: Params) {
    this.#service = remotePlayerService;
  }

  async getStatus(_: Request, res: Response) {
    const status = await this.#service.getStatusOrFail();

    res.send(status);
  }

  async getPlaylist(_: Request, res: Response) {
    const ret = await this.#service.getPlaylist();

    res.send(ret);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/status", this.getStatus.bind(this));
    router.get("/playlist", this.getPlaylist.bind(this));

    return router;
  }
}