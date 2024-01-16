import { EpisodeRepository, EpisodeRepositoryExpandEnum } from "#modules/episodes";
import { SerieRepository } from "#modules/series";
import {HistoryListDeleteOneEntryByIdRequest, HistoryListGetManyEntriesBySearchRequest, HistoryListGetManyEntriesBySuperIdRequest,
  HistoryListGetOneByIdRequest,
  assertIsHistoryListDeleteOneEntryByIdRequest,
  assertIsHistoryListGetManyEntriesBySearchRequest,
  assertIsHistoryListGetManyEntriesBySuperIdRequest,
  assertIsHistoryListGetOneByIdRequest} from "#shared/models/historyLists";
import { assertFound } from "#shared/utils/http/validation";
import { Controller, SecureRouter } from "#utils/express";
import { CanGetAll, CanGetOneById } from "#utils/layers/controller";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { validateReq } from "#utils/validation/zod-express";
import express, { Request, Response, Router } from "express";
import LastTimePlayedService from "../LastTimePlayedService";
import { Entry, EntryWithId, Model, assertIsEntryWithId } from "../models";
import { ListRepository } from "../repositories";

const DepsMap = {
  historyListRepository: ListRepository,
  serieRepository: SerieRepository,
  episodeRepository: EpisodeRepository,
  lastTimePlayedService: LastTimePlayedService,
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class RestController
implements
    Controller,
    CanGetOneById<HistoryListGetOneByIdRequest, Response>,
    CanGetAll<Request, Response>
{
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async getAll(_: Request, res: Response): Promise<void> {
    const got = this.#deps.historyListRepository.getAll();

    res.send(got);
  }

  async #getOneByIdByRequest(
    req: HistoryListGetOneByIdRequest,
  ): Promise<Model> {
    const { id } = req.params;
    const got = await this.#deps.historyListRepository.getOneByIdOrCreate(id);

    assertFound(got);

    return got;
  }

  async getOneById(
    req: HistoryListGetOneByIdRequest,
    res: Response,
  ): Promise<void> {
    const got = await this.#getOneByIdByRequest(req);

    res.send(got);
  }

  async getManyEntriesByHistoryListId(
    req: HistoryListGetOneByIdRequest,
    res: Response,
  ): Promise<void> {
    const got = await this.#getOneByIdByRequest(req);

    res.send(got.entries);
  }

  async #getEntriesWithCriteriaApplied(
    entries: EntryWithId[],
    body: HistoryListGetManyEntriesBySuperIdRequest["body"],
  ) {
    let newEntries = entries;

    if (body.filter) {
      newEntries = newEntries.filter((entry) => {
        const { episodeId: {serieId, innerId} } = entry;

        if (body.filter?.serieId && serieId !== body.filter.serieId)
          return false;

        if (body.filter?.episodeId && innerId !== body.filter.episodeId)
          return false;

        if (body.filter?.timestampMax !== undefined && entry.date.timestamp > body.filter.timestampMax)
          return false;

        return true;
      } );
    }

    if (body.sort) {
      const { timestamp } = body.sort;
      const descSort = (a: Entry, b: Entry) =>
        b.date.timestamp - a.date.timestamp;
      const ascSort = (a: Entry, b: Entry) =>
        a.date.timestamp - b.date.timestamp;

      if (timestamp === "asc")
        newEntries = newEntries.toSorted(ascSort);
      else if (timestamp === "desc")
        newEntries = newEntries.toSorted(descSort);
    }

    if (body.offset)
      newEntries = newEntries.slice(body.offset);

    if (body.limit)
      newEntries = newEntries.slice(0, body.limit);

    if (body.expand) {
      if (body.expand.includes("series")) {
        const promises = newEntries.map(async (entry) => {
          const { episodeId: {serieId} } = entry;
          const serie = await this.#deps.serieRepository.getOneById(serieId);

          if (serie)
            // eslint-disable-next-line no-param-reassign
            entry.serie = serie;

          return entry;
        } );

        newEntries = await Promise.all(promises);
      }

      if (body.expand.includes("episodes")) {
        const promises = newEntries.map(async (entry) => {
          const { episodeId: {innerId, serieId} } = entry;
          const episode = await this.#deps.episodeRepository.getOneById( {
            innerId,
            serieId,
          }, {
            expand: [EpisodeRepositoryExpandEnum.FileInfo],
          } );

          if (episode)
            // eslint-disable-next-line no-param-reassign
            entry.episode = episode;

          return entry;
        } );

        newEntries = await Promise.all(promises);
      }
    }

    return newEntries;
  }

  async getManyEntriesByHistoryListIdSearch(
    req: HistoryListGetManyEntriesBySuperIdRequest,
    res: Response,
  ): Promise<void> {
    const got = await this.#getOneByIdByRequest(req);
    let { entries } = got;

    entries = await this.#getEntriesWithCriteriaApplied(entries, req.body);

    res.send(entries);
  }

  async getManyEntriesBySearch(
    req: HistoryListGetManyEntriesBySearchRequest,
    res: Response,
  ): Promise<void> {
    const got = await this.#deps.historyListRepository.getAll();
    let entries: EntryWithId[] = [];

    for (const historyList of got)
      entries.push(...historyList.entries);

    entries = await this.#getEntriesWithCriteriaApplied(entries, req.body);

    res.send(entries);
  }

  async deleteOneEntryById(
    req: HistoryListDeleteOneEntryByIdRequest,
    res: Response,
  ): Promise<void> {
    const {id, entryId} = req.params;
    const historyList = await this.#deps.historyListRepository.getOneByIdOrCreate(id);

    assertFound(historyList);

    const entryIndex = historyList.entries.findIndex((entry: EntryWithId) => entry.id === entryId);

    assertFound(entryIndex !== -1);

    const [deleted] = historyList.entries.splice(entryIndex, 1);

    assertIsEntryWithId(deleted);

    await this.#deps.historyListRepository.updateOneById(historyList.id, historyList);

    this.#deps.lastTimePlayedService.updateEpisodeLastTimePlayedFromEntriesAndGet( {
      episodeId: deleted.episodeId,
      entries: historyList.entries,
    } );

    res.send(deleted);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/", this.getAll.bind(this));
    router.get("/:id",
      validateReq(assertIsHistoryListGetOneByIdRequest),
      this.getOneById.bind(this),
    );
    router.get(
      "/:id/entries",
      validateReq(assertIsHistoryListGetOneByIdRequest),
      this.getManyEntriesByHistoryListId.bind(this),
    );

    router.delete(
      "/:id/entries/:entryId",
      validateReq(assertIsHistoryListDeleteOneEntryByIdRequest),
      this.deleteOneEntryById.bind(this),
    );

    router.use(express.json());
    router.post(
      "/entries/search",
      validateReq(assertIsHistoryListGetManyEntriesBySearchRequest),
      this.getManyEntriesBySearch.bind(this),
    );
    router.options("/entries/search", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "POST,DELETE,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
      res.sendStatus(200);
    } );
    router.post(
      "/:id/entries/search",
      validateReq(assertIsHistoryListGetManyEntriesBySuperIdRequest),
      this.getManyEntriesByHistoryListIdSearch.bind(this),
    );

    return router;
  }
}
