/* eslint-disable no-use-before-define */
import { PublicMethodsOf } from "#shared/utils/types";
import { SecureRouter } from "#utils/express";
import { Request, Response, Router } from "express";
import { MusicRepository } from "..";
import { UpdateRemoteTreeService } from "../services/update-remote-tree";

type Params = {
  musicRepository: MusicRepository;
};
export default class FixController {
  #musicRepository: PublicMethodsOf<MusicRepository>;

  constructor( { musicRepository }: Params) {
    this.#musicRepository = musicRepository;
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
