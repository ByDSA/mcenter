import { FullResponse } from "#shared/utils/http";
import { Response, Router } from "express";
import { UpdateMetadataProcess } from "./UpdateSavedProcess";
import { UpdateEpisodesFileRequest, assertIsUpdateEpisodesFileRequest } from "./validation";
import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { validateReq } from "#utils/validation/zod-express";

const DEPS_MAP = {
  updateMetadataProcess: UpdateMetadataProcess,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class EpisodesUpdateController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async endpoint(req: UpdateEpisodesFileRequest, res: Response) {
    const { forceHash } = req.query;
    const { errors, data } = await this.#deps.updateMetadataProcess.process( {
      forceHash: forceHash === "1" || forceHash === "true",
    } );
    const responseObj: FullResponse = {
      data,
      errors,
    };

    res.send(responseObj);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get(
      "/saved",
      validateReq(assertIsUpdateEpisodesFileRequest),
      this.endpoint.bind(this),
    );

    return router;
  }
}
