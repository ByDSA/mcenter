/* eslint-disable no-use-before-define */
import { PublicMethodsOf } from "#shared/utils/types";
import { SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { Router } from "express";
import { MusicRepository } from "..";
import { Repository } from "../repositories";

const API = "/api";
const CREATE = `${API}/create`;
const ROUTE_CREATE_YT = `${CREATE}/yt`;
const DepsMap = {
  musicRepository: Repository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class FixController {
  #musicRepository: PublicMethodsOf<MusicRepository>;

  constructor(deps?: Partial<Deps>) {
    this.#musicRepository = (deps as Deps).musicRepository;
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get(`${ROUTE_CREATE_YT}/:id`, async (req, res) => {
      const { id } = req.params;
      const data = await this.#musicRepository.findOrCreateFromYoutube(id);

      res.send(data);
    } );

    return router;
  }
}
