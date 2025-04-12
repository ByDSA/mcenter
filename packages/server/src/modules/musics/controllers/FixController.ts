import { PublicMethodsOf } from "#shared/utils/types";
import { Router } from "express";
import { SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { MusicRepository } from "../repositories";

const API = "/api";
const CREATE = `${API}/create`;
const ROUTE_CREATE_YT = `${CREATE}/yt`;
const DEPS_MAP = {
  musicRepository: MusicRepository,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class MusicFixController {
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
