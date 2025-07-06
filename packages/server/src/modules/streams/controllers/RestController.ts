import { CriteriaSortDir } from "#shared/utils/criteria";
import { Request, Response, Router } from "express";
import z from "zod";
import { HistoryListRepository } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { StreamOriginType } from "#modules/streams/models";
import { CriteriaSort, getManyBySearch } from "#modules/streams/models/dto";
import { Controller, SecureRouter } from "#utils/express";
import { CanGetAll, CanGetMany } from "#utils/layers/controller";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { validateReq } from "#utils/validation/zod-express";
import { StreamRepository } from "../repositories";
import { assertZod } from "#sharedSrc/utils/validation/zod";

type StreamGetManyRequest = {
  body: z.infer<typeof getManyBySearch.reqBodySchema>;
};

const DEPS_MAP = {
  streamRepository: StreamRepository,
  serieRepository: SerieRepository,
  historyListRepository: HistoryListRepository,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class StreamsRestController
implements
    Controller,
    CanGetAll<Request, Response>,
    CanGetMany<StreamGetManyRequest, Response> {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async getAll(_: Request, res: Response): Promise<void> {
    const got = await this.#deps.streamRepository.getAll();

    res.send(got);
  }

  async getMany(req: StreamGetManyRequest, res: Response): Promise<void> {
    let got = await this.#deps.streamRepository.getAll();

    if (req.body.expand) {
      for (const stream of got) {
        for (const origin of stream.group.origins) {
          if (origin.type === StreamOriginType.SERIE) {
            // TODO: quitar await en for si se puede
            origin.serie = await this.#deps.serieRepository.getOneById(origin.id) ?? undefined;
          }
        }
      }
    }

    if (req.body.sort) {
      if (req.body.sort[CriteriaSort.lastTimePlayed]) {
        const lastTimePlayedDic: {[key: string]: number | undefined} = {};

        for (const stream of got) {
          const serieId = stream.group.origins[0]?.id;

          if (!serieId)

            continue;

          const historyList = await this.#deps.historyListRepository.getOneByIdOrCreate(stream.id);
          const lastEntry = historyList?.entries.at(-1);

          if (lastEntry)
            lastTimePlayedDic[serieId] = lastEntry.date.timestamp;
        }

        // cambiar por toSorted en node 20
        got = got.sort((a, b) => {
          const serieIdA = a.group.origins[0]?.id;
          const serieIdB = b.group.origins[0]?.id;

          if (!serieIdA || !serieIdB)
            return -1;

          const lastTimePlayedA = lastTimePlayedDic[serieIdA] ?? 0;
          const lastTimePlayedB = lastTimePlayedDic[serieIdB] ?? 0;

          if (req.body.sort?.lastTimePlayed === CriteriaSortDir.ASC)
            return lastTimePlayedA - lastTimePlayedB;

          return lastTimePlayedB - lastTimePlayedA;
        } );
      }
    }

    res.send(got);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/", this.getAll.bind(this));
    router.post(
      "/criteria",
      validateReq((req: StreamGetManyRequest) => {
        assertZod(getManyBySearch.reqBodySchema, req.body);

        return req;
      } ),
      this.getMany.bind(this),
    );

    router.options("/", (_req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(200);
    } );
    router.options("/criteria", (_req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(200);
    } );

    return router;
  }
}
