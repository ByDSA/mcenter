import { Request, Response } from "express";
import { Body, Controller, Param } from "@nestjs/common";
import { assertFound } from "$shared/utils/http/validation";
import { showError } from "$shared/utils/errors/showError";
import { deleteOneEntryById } from "$shared/models/history-lists/dto/rest/delete-one-entry-by-id";
import { getManyEntriesByCriteria } from "$shared/models/history-lists/dto/rest/get-many-entries-by-criteria";
import { getManyEntriesBySuperId } from "$shared/models/history-lists/dto/rest/get-many-entries-by-superid";
import { getOneByIdReqParamsSchema } from "$shared/models/history-lists/dto/rest/get-one-by-id";
import { createZodDto } from "nestjs-zod";
import { EpisodeRepository, EpisodeRepositoryExpandEnum } from "#episodes/index";
import { SerieRepository } from "#modules/series";
import { CanGetAll } from "#utils/layers/controller";
import { DeleteOne, GetOne } from "#utils/nestjs/rest";
import { GetMany, GetManyCriteria } from "#utils/nestjs/rest/Get";
import { getIdFromEntry, HistoryListRepository } from "../repositories";
import { HistoryEntry, HistoryEntryEntity, assertIsHistoryEntryEntity, historyListEntitySchema, historyEntryEntitySchema, historyEntrySchema, historyEntryToEntity } from "../models";
import { LastTimePlayedService } from "../LastTimePlayedService";

namespace Dto {
  export class GetManyEntriesByIdBody extends createZodDto(getManyEntriesBySuperId.reqBodySchema) {}
  // eslint-disable-next-line max-len
  export class GetManyEntriesByCriteriaBody extends createZodDto(getManyEntriesByCriteria.reqBodySchema) {}
  export class GetOneByIdParams extends createZodDto(getOneByIdReqParamsSchema) {}
  export class GetManyEntriesByIdParams extends createZodDto(getOneByIdReqParamsSchema) {}
  export class DeleteOneEntryByIdParams extends createZodDto(deleteOneEntryById.reqParamsSchema) {}
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

  @GetMany("/", historyListEntitySchema)
  async getAll() {
    return await this.historyListRepository.getAll();
  }

  @GetOne("/:id", historyListEntitySchema)
  async getOneById(
    @Param() params: Dto.GetOneByIdParams,
  ) {
    const got = await this.historyListRepository.getOneByIdOrCreate(params.id);

    assertFound(got);

    return got;
  }

  @GetMany("/:id/entries", historyEntrySchema)
  async getManyEntriesByHistoryListId(
    @Param() params: Dto.GetOneByIdParams,
  ) {
    const got = await this.historyListRepository.getOneByIdOrCreate(params.id);

    assertFound(got);

    return got.entries;
  }

  async #getEntriesWithCriteriaApplied(
    entries: HistoryEntryEntity[],
    body: Dto.GetManyEntriesByIdBody = {},
  ): Promise<HistoryEntryEntity[]> {
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

  @GetManyCriteria("/:id/entries/search", historyEntryEntitySchema)
  async getManyEntriesByHistoryListIdSearch(
    @Body() body: Dto.GetManyEntriesByIdBody,
    @Param() params: Dto.GetManyEntriesByIdParams,
  ) {
    const got = await this.historyListRepository.getOneByIdOrCreate(params.id);

    assertFound(got);
    let entries = got.entries.map(e=>historyEntryToEntity(e, got));

    entries = await this.#getEntriesWithCriteriaApplied(entries, body);

    return entries;
  }

  @GetManyCriteria("/entries/search", historyEntryEntitySchema)
  async getManyEntriesBySearch(
    @Body() body: Dto.GetManyEntriesByCriteriaBody,
  ) {
    const got = await this.historyListRepository.getAll();
    let entries: HistoryEntryEntity[] = [];

    for (const historyList of got)
      entries.push(...historyList.entries.map(e=>historyEntryToEntity(e, historyList)));

    entries = await this.#getEntriesWithCriteriaApplied(entries, body);

    return entries;
  }

  @DeleteOne("/:id/entries/:entryId", historyEntryEntitySchema)
  async deleteOneEntryByIdAndGet(
    @Param() params: Dto.DeleteOneEntryByIdParams,
  ): Promise<HistoryEntryEntity> {
    const { id, entryId } = params;
    const historyList = await this.historyListRepository.getOneByIdOrCreate(id);

    assertFound(historyList);

    // eslint-disable-next-line max-len
    // TODO: igual ejecutar esto en paralelo, usando el índice, hace que elimine índices que no toca.
    const entryIndex = historyList.entries.findIndex(
      (entry: HistoryEntry) => getIdFromEntry(entry) === entryId,
    );
    const found = entryIndex > 0 ? true : undefined;

    assertFound(found);

    const [deleted] = historyList.entries.splice(entryIndex, 1);

    assertIsHistoryEntryEntity(deleted);

    await this.historyListRepository.updateOneById(historyList.id, historyList);

    this.lastTimePlayedService.updateEpisodeLastTimePlayedFromEntriesAndGet( {
      episodeId: deleted.episodeId,
      entries: historyList.entries,
    } ).catch(showError);

    return deleted;
  }
}
