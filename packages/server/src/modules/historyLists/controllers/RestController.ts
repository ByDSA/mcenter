import { showError } from "#shared/utils/errors/showError";
import { assertFound } from "#shared/utils/http/validation";
import express, { Request, Response, Router } from "express";
import { EpisodeRepository, EpisodeRepositoryExpandEnum } from "#episodes/index";
import { HistoryListDeleteOneEntryByIdRequest,
  HistoryListDeleteOneEntryByIdResBody,
  HistoryListGetManyEntriesBySearchRequest,
  HistoryListGetManyEntriesBySuperIdRequest,
  HistoryListGetOneByIdRequest,
  assertIsHistoryListDeleteOneEntryByIdRequest,
  assertIsHistoryListDeleteOneEntryByIdResBody,
  assertIsHistoryListGetManyEntriesBySearchRequest,
  assertIsHistoryListGetManyEntriesBySuperIdRequest,
  assertIsHistoryListGetOneByIdRequest } from "#modules/historyLists/models/transport";
import { SerieRepository } from "#modules/series";
import { Controller, SecureRouter } from "#utils/express";
import { CanGetAll, CanGetOneById } from "#utils/layers/controller";
import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { validateReq } from "#utils/validation/zod-express";
import { HistoryListRepository } from "../repositories";
import { HistoryEntry, HistoryEntryWithId, HistoryList, assertIsHistoryEntryWithId } from "../models";
import { LastTimePlayedService } from "../LastTimePlayedService";

const DEPS_MAP = {
  historyListRepository: HistoryListRepository,
  serieRepository: SerieRepository,
  episodeRepository: EpisodeRepository,
  lastTimePlayedService: LastTimePlayedService,
};

type Deps = DepsFromMap<typeof DEPS_MAP>;
@injectDeps(DEPS_MAP)
export class HistoryListRestController
implements
    Controller,
    CanGetOneById<HistoryListGetOneByIdRequest, Response>,
    CanGetAll<Request, Response> {
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async getAll(_: Request, res: Response): Promise<void> {
    const got = await this.#deps.historyListRepository.getAll();

    res.send(got);
  }

  async #getOneByIdByRequest(
    req: HistoryListGetOneByIdRequest,
  ): Promise<HistoryList> {
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
    entries: HistoryEntryWithId[],
    body: HistoryListGetManyEntriesBySuperIdRequest["body"],
  ) {
    let newEntries = entries;

    if (body.filter) {
      newEntries = newEntries.filter((entry) => {
        const { episodeId: { serieId, innerId } } = entry;

        if (body.filter?.serieId && serieId !== body.filter.serieId)
          return false;

        if (body.filter?.episodeId && innerId !== body.filter.episodeId)
          return false;

        if (body.filter?.timestampMax !== undefined
           && entry.date.timestamp > body.filter.timestampMax)
          return false;

        return true;
      } );
    }

    if (body.sort) {
      const { timestamp } = body.sort;
      const descSort = (a: HistoryEntry, b: HistoryEntry) => b.date.timestamp - a.date.timestamp;
      const ascSort = (a: HistoryEntry, b: HistoryEntry) => a.date.timestamp - b.date.timestamp;

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
          const { episodeId: { serieId } } = entry;
          const serie = await this.#deps.serieRepository.getOneById(serieId);

          if (serie)

            entry.serie = serie;

          return entry;
        } );

        newEntries = await Promise.all(promises);
      }

      if (body.expand.includes("episodes")) {
        const promises = newEntries.map(async (entry) => {
          const { episodeId: { innerId, serieId } } = entry;
          const episode = await this.#deps.episodeRepository.getOneById( {
            innerId,
            serieId,
          }, {
            expand: [EpisodeRepositoryExpandEnum.FileInfo],
          } );

          if (episode)

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
    let entries: HistoryEntryWithId[] = [];

    for (const historyList of got)
      entries.push(...historyList.entries);

    entries = await this.#getEntriesWithCriteriaApplied(entries, req.body);

    res.send(entries);
  }

  async deleteOneEntryById(
    req: HistoryListDeleteOneEntryByIdRequest,
    res: Response,
  ): Promise<void> {
    const { id, entryId } = req.params;
    const historyList = await this.#deps.historyListRepository.getOneByIdOrCreate(id);

    assertFound(historyList);

    const entryIndex = historyList.entries.findIndex(
      (entry: HistoryEntryWithId) => entry.id === entryId,
    );

    assertFound(entryIndex !== -1);

    const [deleted] = historyList.entries.splice(entryIndex, 1);

    assertIsHistoryEntryWithId(deleted);

    await this.#deps.historyListRepository.updateOneById(historyList.id, historyList);

    this.#deps.lastTimePlayedService.updateEpisodeLastTimePlayedFromEntriesAndGet( {
      episodeId: deleted.episodeId,
      entries: historyList.entries,
    } ).catch(showError);

    const body: HistoryListDeleteOneEntryByIdResBody = {
      entry: deleted,
    };

    assertIsHistoryListDeleteOneEntryByIdResBody(body);

    res.send(body);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/", this.getAll.bind(this));
    router.get(
      "/:id",
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
    router.options("/entries/search", (_req, res) => {
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
