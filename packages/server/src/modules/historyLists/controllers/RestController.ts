/* eslint-disable no-empty-function */
import { showError } from "#shared/utils/errors/showError";
import { assertFound } from "#shared/utils/http/validation";
import { Request, Response } from "express";
import z from "zod";
import { assertZod } from "#shared/utils/validation/zod";
import { Body, Controller, Header, HttpCode, HttpStatus, Options, Param } from "@nestjs/common";
import { EpisodeRepository, EpisodeRepositoryExpandEnum } from "#episodes/index";
import { deleteOneEntryById, getManyEntriesBySearch, getManyEntriesBySuperId, getOneByIdReqParamsSchema } from "#modules/historyLists/models/dto";
import { SerieRepository } from "#modules/series";
import { CanGetAll } from "#utils/layers/controller";
import { DeleteOne, GetOne } from "#utils/nestjs/rest";
import { GetMany, GetManyCriteria } from "#utils/nestjs/rest/Get";
import { HistoryListRepository } from "../repositories";
import { HistoryEntry, HistoryEntryWithId, assertIsHistoryEntryWithId, historyListSchema, historyEntrySchema } from "../models";
import { LastTimePlayedService } from "../LastTimePlayedService";

type HistoryListGetOneByIdRequest = {
  params: z.infer<typeof getOneByIdReqParamsSchema>;
};

type HistoryListGetManyEntriesBySuperIdRequest = {
  params: z.infer<typeof getOneByIdReqParamsSchema>;
  body: z.infer<typeof getManyEntriesBySuperId.reqBodySchema>;
};

type HistoryListGetManyEntriesBySearchRequest = {
  body: z.infer<typeof getManyEntriesBySearch.reqBodySchema>;
};

type HistoryListDeleteOneEntryByIdRequest = {
  params: z.infer<typeof deleteOneEntryById.reqParamsSchema>;
};

type HistoryListDeleteOneEntryByIdRes = {
  body: z.infer<typeof deleteOneEntryById.resBodySchema>;
};

@Controller()
export class HistoryListRestController
implements
    CanGetAll<Request, Response> {
  constructor(
    private historyListRepository: HistoryListRepository,
    private serieRepository: SerieRepository,
    private episodeRepository: EpisodeRepository,
    private lastTimePlayedService: LastTimePlayedService,
  ) {
  }

  @GetMany("/", historyListSchema)
  async getAll() {
    return await this.historyListRepository.getAll();
  }

  @GetOne("/:id", historyListSchema)
  async getOneById(
    @Param() params: HistoryListGetOneByIdRequest["params"],
  ) {
    //  assertZod(getOneByIdReqParamsSchema, req.params);
    const got = await this.historyListRepository.getOneByIdOrCreate(params.id);

    assertFound(got);

    return got;
  }

  @GetMany("/:id/entries", historyEntrySchema)
  async getManyEntriesByHistoryListId(
    @Param() params: HistoryListGetOneByIdRequest["params"],
  ) {
    //  assertZod(getOneByIdReqParamsSchema, req.params);
    const got = await this.historyListRepository.getOneByIdOrCreate(params.id);

    assertFound(got);

    return got.entries;
  }

  async #getEntriesWithCriteriaApplied(
    entries: HistoryEntryWithId[],
    body: HistoryListGetManyEntriesBySuperIdRequest["body"] = {},
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
          const serie = await this.serieRepository.getOneById(serieId);

          if (serie)

            entry.serie = serie;

          return entry;
        } );

        newEntries = await Promise.all(promises);
      }

      if (body.expand.includes("episodes")) {
        const promises = newEntries.map(async (entry) => {
          const { episodeId: { innerId, serieId } } = entry;
          const episode = await this.episodeRepository.getOneById( {
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

  @GetManyCriteria("/:id/entries/search", historyEntrySchema)
  async getManyEntriesByHistoryListIdSearch(
    @Body() body: HistoryListGetManyEntriesBySuperIdRequest["body"],
    @Param() params: HistoryListGetManyEntriesBySuperIdRequest["params"],
  ) {
    // assertZod(getManyEntriesBySuperId.reqBodySchema, req.body);
    // assertZod(getOneByIdReqParamsSchema, req.params);
    const got = await this.historyListRepository.getOneByIdOrCreate(params.id);

    assertFound(got);
    let { entries } = got;

    entries = await this.#getEntriesWithCriteriaApplied(entries, body);

    return entries;
  }

  @GetManyCriteria("/entries/search", historyEntrySchema)
  async getManyEntriesBySearch(
    @Body() body: HistoryListGetManyEntriesBySearchRequest["body"],
  ) {
    //  assertZod(getManyEntriesBySearch.reqBodySchema, req.body);
    const got = await this.historyListRepository.getAll();
    let entries: HistoryEntryWithId[] = [];

    for (const historyList of got)
      entries.push(...historyList.entries);

    entries = await this.#getEntriesWithCriteriaApplied(entries, body);

    return entries;
  }

  @DeleteOne("/:id/entries/:entryId")
  async deleteOneEntryById(
    @Param() params: HistoryListDeleteOneEntryByIdRequest["params"],
  ) {
    // assertZod(deleteOneEntryById.reqParamsSchema, req.params);
    const { id, entryId } = params;
    const historyList = await this.historyListRepository.getOneByIdOrCreate(id);

    assertFound(historyList);

    const entryIndex = historyList.entries.findIndex(
      (entry: HistoryEntryWithId) => entry.id === entryId,
    );

    assertFound(entryIndex !== -1);

    const [deleted] = historyList.entries.splice(entryIndex, 1);

    assertIsHistoryEntryWithId(deleted);

    await this.historyListRepository.updateOneById(historyList.id, historyList);

    this.lastTimePlayedService.updateEpisodeLastTimePlayedFromEntriesAndGet( {
      episodeId: deleted.episodeId,
      entries: historyList.entries,
    } ).catch(showError);

    const body: HistoryListDeleteOneEntryByIdRes["body"] = {
      deleted: [deleted],
    };

    assertZod(deleteOneEntryById.resBodySchema, body);

    return body;
  }

  @Options("/:user/search")
  @Header("Access-Control-Allow-Origin", "*")
  @Header("Access-Control-Allow-Methods", "POST,DELETE,OPTIONS")
  @Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With")
  @HttpCode(HttpStatus.OK)
  async options(): Promise<void> {
  }
}
