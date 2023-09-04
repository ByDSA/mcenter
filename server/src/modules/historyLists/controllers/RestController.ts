import { Controller, SecureRouter } from "#utils/express";
import { assertFound } from "#utils/http/validation";
import { CanGetOneById } from "#utils/layers/controller";
import { Response, Router } from "express";
import { Repository } from "../repositories";
import { GetOneByIdRequest, getOneByIdValidation } from "./validation";

type Params = {
  historyListRepository: Repository;
};
export default class RestController
implements Controller, CanGetOneById<GetOneByIdRequest, Response> {
  #historyListRepository: Repository;

  constructor( {historyListRepository}: Params) {
    this.#historyListRepository = historyListRepository;
  }

  async getOneById(req: GetOneByIdRequest, res: Response): Promise<void> {
    const {id} = req.params;
    const got = await this.#historyListRepository.getOneById(id);

    assertFound(got);

    res.send(got);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/:id", getOneByIdValidation, this.getOneById.bind(this));

    return router;
  }
}