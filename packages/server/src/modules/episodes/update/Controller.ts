import { FullResponse } from "#shared/utils/http";
import { Controller, SecureRouter } from "#utils/express";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { validateRequest } from "#utils/validation/zod-express";
import { Response, Router } from "express";
import UpdateMetadataProcess from "./UpdateSavedProcess";
import { UpdateEpisodesFileRequest, assertIsUpdateEpisodesFileRequest } from "./validation";

const DepsMap = {
  updateMetadataProcess: UpdateMetadataProcess,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class ThisController implements Controller {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async endpoint(req: UpdateEpisodesFileRequest, res: Response) {
    const {forceHash} = req.query;
    const {errors, data} = await this.#deps.updateMetadataProcess.process( {
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

    router.get("/saved", validateRequest(assertIsUpdateEpisodesFileRequest),this.endpoint.bind(this));

    return router;
  }
}