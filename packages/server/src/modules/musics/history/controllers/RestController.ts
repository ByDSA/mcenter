import express, { Request, Response, Router } from "express";
import { MusicHistoryListGetManyEntriesBySearchRequest, assertIsMusicHistoryListGetManyEntriesBySearchRequest } from "#musics/history/models/transport";
import { Controller, SecureRouter } from "#utils/express";
import { CanGetAll } from "#utils/layers/controller";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { validateReq } from "#utils/validation/zod-express";
import { GetManyCriteria } from "../repositories/Repository";
import { MusicHistoryRepository } from "../repositories";
import { MusicRepository } from "../../repositories";

const DEPS_MAP = {
  historyRepository: MusicHistoryRepository,
  musicRepository: MusicRepository,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class MusicHistoryRestController
implements
    Controller,
    CanGetAll<Request, Response> {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async getAll(_: Request, res: Response): Promise<void> {
    const got = await this.#deps.historyRepository.getAll();

    res.send(got);
  }

  async getManyEntriesBySearch(
    req: MusicHistoryListGetManyEntriesBySearchRequest,
    res: Response,
  ): Promise<void> {
    const criteria = bodyToCriteria(req.body);
    const got = await this.#deps.historyRepository.getManyCriteria(criteria);

    res.send(got);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.use(express.json());
    router.post(
      "/:user/search",
      validateReq(assertIsMusicHistoryListGetManyEntriesBySearchRequest),
      this.getManyEntriesBySearch.bind(this),
    );
    router.options("/:user/search", (_req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(200);
    } );

    return router;
  }
}

function bodyToCriteria(body: MusicHistoryListGetManyEntriesBySearchRequest["body"]): GetManyCriteria {
  const ret: GetManyCriteria = {
    expand: body.expand,
    limit: body.limit,
    offset: body.offset,
  };

  if (body.filter) {
    ret.filter = {};

    if (body.filter.resourceId)
      ret.filter.resourceId = body.filter.resourceId;

    if (body.filter.timestampMax)
      ret.filter.timestampMax = body.filter.timestampMax;
  }

  if (body.sort) {
    if (body.sort.timestamp)
      ret.sort = body.sort.timestamp;
  }

  return ret;
}
