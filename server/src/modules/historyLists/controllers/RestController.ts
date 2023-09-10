import { EpisodeRepository } from "#modules/episodes";
import { SerieRepository } from "#modules/series";
import {HistoryListDeleteOneEntryByIdRequest, HistoryListGetManyEntriesBySearchRequest, HistoryListGetManyEntriesBySuperIdRequest,
  HistoryListGetOneByIdRequest} from "#shared/models/historyLists";
import { Controller, SecureRouter } from "#utils/express";
import { assertFound } from "#utils/http/validation";
import { CanGetAll, CanGetOneById } from "#utils/layers/controller";
import express, { Request, Response, Router } from "express";
import { Entry, EntryWithId, Model, assertIsEntryWithId } from "../models";
import { ListRepository } from "../repositories";
import {deleteOneEntryByIdValidation, getManyEntriesBySearchValidation,
  getManyEntriesBySuperIdValidation,
  getOneByIdValidation} from "./validation";

type Params = {
  historyListRepository: ListRepository;
  serieRepository: SerieRepository;
  episodeRepository: EpisodeRepository;
};
export default class RestController
implements
    Controller,
    CanGetOneById<HistoryListGetOneByIdRequest, Response>,
    CanGetAll<Request, Response>
{
  #historyListRepository: ListRepository;

  #serieRepository: SerieRepository;

  #episodeRepository: EpisodeRepository;

  constructor( {historyListRepository,
    episodeRepository,
    serieRepository}: Params) {
    this.#historyListRepository = historyListRepository;
    this.#serieRepository = serieRepository;
    this.#episodeRepository = episodeRepository;
  }

  async getAll(_: Request, res: Response): Promise<void> {
    const got = this.#historyListRepository.getAll();

    res.send(got);
  }

  async #getOneByIdByRequest(
    req: HistoryListGetOneByIdRequest,
  ): Promise<Model> {
    const { id } = req.params;
    const got = await this.#historyListRepository.getOneById(id);

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
        const { serieId, episodeId } = entry;

        if (body.filter?.serieId && serieId !== body.filter.serieId)
          return false;

        if (body.filter?.episodeId && episodeId !== body.filter.episodeId)
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

      // TODO: cambiar a toSorted en node 20
      if (timestamp === "asc")
        newEntries = newEntries.sort(ascSort);
      else if (timestamp === "desc")
        newEntries = newEntries.sort(descSort);
    }

    if (body.offset)
      newEntries = newEntries.slice(body.offset);

    if (body.limit)
      newEntries = newEntries.slice(0, body.limit);

    if (body.expand) {
      if (body.expand.includes("series")) {
        const promises = newEntries.map(async (entry) => {
          const { serieId } = entry;
          const serie = await this.#serieRepository.getOneById(serieId);

          if (serie)
            // eslint-disable-next-line no-param-reassign
            entry.serie = serie;

          return entry;
        } );

        newEntries = await Promise.all(promises);
      }

      if (body.expand.includes("episodes")) {
        const promises = newEntries.map(async (entry) => {
          const { episodeId, serieId } = entry;
          const episode = await this.#episodeRepository.getOneById( {
            episodeId,
            serieId,
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
    const got = await this.#historyListRepository.getAll();
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
    const historyList = await this.#historyListRepository.getOneById(id);

    assertFound(historyList);

    const entryIndex = historyList.entries.findIndex((entry: EntryWithId) => entry.id === entryId);

    assertFound(entryIndex !== -1);

    const [deleted] = historyList.entries.splice(entryIndex, 1);

    assertIsEntryWithId(deleted);

    await this.#historyListRepository.updateOneById(historyList.id, historyList);

    res.send(deleted);
  }

  getRouter(): Router {
    const router = SecureRouter();

    router.get("/", this.getAll.bind(this));
    router.get("/:id", getOneByIdValidation, this.getOneById.bind(this));
    router.get(
      "/:id/entries",
      getOneByIdValidation,
      this.getManyEntriesByHistoryListId.bind(this),
    );

    router.delete(
      "/:id/entries/:entryId",
      deleteOneEntryByIdValidation,
      this.deleteOneEntryById.bind(this),
    );

    router.use(express.json());
    router.post(
      "/entries/search",
      getManyEntriesBySearchValidation,
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
      getManyEntriesBySuperIdValidation,
      this.getManyEntriesByHistoryListIdSearch.bind(this),
    );

    return router;
  }
}
