import { FullResponse } from "#shared/utils/http";
import { Controller, SecureRouter } from "#utils/express";
import { validateRequest } from "#utils/validation/zod-express";
import { Response, Router } from "express";
import { SavedSerieTreeService } from "../../saved-serie-tree-service";
import { Repository } from "../repositories";
import UpdateMetadataProcess from "./UpdateSavedProcess";
import { UpdateEpisodesFileRequest, assertIsUpdateEpisodesFileRequest } from "./validation";

type Params = {
  savedSerieTreeService: SavedSerieTreeService;
  episodeFileRepository: Repository;
};
export default class ThisController implements Controller {
  #episodeFileRepository: Repository;

  #savedSerieTreeService: SavedSerieTreeService;

  constructor( {episodeFileRepository,savedSerieTreeService}: Params) {
    this.#episodeFileRepository = episodeFileRepository;
    this.#savedSerieTreeService = savedSerieTreeService;
  }

  async endpoint(req: UpdateEpisodesFileRequest, res: Response) {
    const {forceHash} = req.query;
    const {errors, data} = await new UpdateMetadataProcess( {
      savedSerieTreeService: this.#savedSerieTreeService,
      episodeFileRepository: this.#episodeFileRepository,
    } ).process( {
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