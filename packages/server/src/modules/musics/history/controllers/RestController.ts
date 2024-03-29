import { HistoryMusicListGetManyEntriesBySearchRequest, assertIsHistoryMusicListGetManyEntriesBySearchRequest } from "#shared/models/musics";
import { Controller, SecureRouter } from "#utils/express";
import { CanGetAll } from "#utils/layers/controller";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { validateReq } from "#utils/validation/zod-express";
import express, { Request, Response, Router } from "express";
import { Repository as MusicRepository } from "../../repositories";
import { Repository } from "../repositories";
import { GetManyCriteria } from "../repositories/Repository";

const DepsMap = {
  historyRepository: Repository,
  musicRepository: MusicRepository,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class RestController
implements
    Controller,
    CanGetAll<Request, Response>
{
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async getAll(_: Request, res: Response): Promise<void> {
    const got = this.#deps.historyRepository.getAll();

    res.send(got);
  }

  async getManyEntriesBySearch(
    req: HistoryMusicListGetManyEntriesBySearchRequest,
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
      validateReq(assertIsHistoryMusicListGetManyEntriesBySearchRequest),
      this.getManyEntriesBySearch.bind(this),
    );
    router.options("/:user/search", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(200);
    } );

    return router;
  }
}

function bodyToCriteria(body: HistoryMusicListGetManyEntriesBySearchRequest["body"]): GetManyCriteria {
  const ret: GetManyCriteria = {
    expand: body.expand,
    limit: body.limit,
    offset: body.offset,
  };

  if (body.filter) {
    ret.filter = {
    };

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
