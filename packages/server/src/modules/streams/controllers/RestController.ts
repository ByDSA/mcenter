/* eslint-disable no-await-in-loop */
import { HistoryListRepository } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { StreamCriteriaSort, StreamGetManyRequest, StreamOriginType } from "#shared/models/streams";
import { CriteriaSortDir } from "#shared/utils/criteria";
import { PublicMethodsOf } from "#shared/utils/types";
import { Controller, SecureRouter } from "#utils/express";
import { CanGetAll, CanGetMany } from "#utils/layers/controller";
import express, { Request, Response, Router } from "express";
import { Repository } from "../repositories";
import { getManyValidation } from "./validation";

type Params = {
  streamRepository: PublicMethodsOf<Repository>;
  serieRepository: PublicMethodsOf<SerieRepository>;
  historyListRepository: PublicMethodsOf<HistoryListRepository>;
};
export default class RestController
implements
    Controller,
    CanGetAll<Request, Response>,
    CanGetMany<StreamGetManyRequest, Response>
{
  #streamRepository: PublicMethodsOf<Repository>;

  #serieRepository: PublicMethodsOf<SerieRepository>;

  #historyListRepository: PublicMethodsOf<HistoryListRepository>;

  constructor( {streamRepository, serieRepository, historyListRepository}: Params) {
    this.#streamRepository = streamRepository;
    this.#serieRepository = serieRepository;
    this.#historyListRepository = historyListRepository;
  }

  async getAll(_: Request, res: Response): Promise<void> {
    const got = await this.#streamRepository.getAll();

    res.send(got);
  }

  async getMany(req: StreamGetManyRequest, res: Response): Promise<void> {
    let got = await this.#streamRepository.getAll();

    if (req.body.expand) {
      for (const stream of got) {
        for (const origin of stream.group.origins) {
          if (origin.type === StreamOriginType.SERIE) {
            // eslint-disable-next-line no-param-reassign, no-await-in-loop
            origin.serie = await this.#serieRepository.getOneById(origin.id) ?? undefined;
          }
        }
      }
    }

    if (req.body.sort) {
      if (req.body.sort[StreamCriteriaSort.lastTimePlayed]) {
        const lastTimePlayedDic: {[key: string]: number | undefined} = {
        };

        for (const stream of got) {
          const serieId = stream.group.origins[0]?.id;

          if (!serieId)
            // eslint-disable-next-line no-continue
            continue;

          const historyList = await this.#historyListRepository.getOneByIdOrCreate(stream.id);
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
    router.use(express.json());
    router.post("/criteria", getManyValidation, this.getMany.bind(this));

    router.options("/", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(200);
    } );
    router.options("/criteria", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(200);
    } );

    return router;
  }
}
