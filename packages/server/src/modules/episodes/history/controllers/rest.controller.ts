import { Request, Response } from "express";
import { Body, Controller, Param } from "@nestjs/common";
import { assertFound } from "$shared/utils/http/validation";
import { showError } from "$shared/utils/errors/showError";
import { createZodDto } from "nestjs-zod";
import { episodeHistoryListRestDto } from "$shared/models/episodes/history/dto/transport";
import { EpisodeRepository, EpisodeRepositoryExpandEnum } from "#episodes/index";
import { SerieRepository } from "#modules/series";
import { CanGetAll } from "#utils/layers/controller";
import { DeleteOne, GetOne } from "#utils/nestjs/rest";
import { GetMany, GetManyCriteria } from "#utils/nestjs/rest/Get";
import { EpisodeHistoryListRepository } from "../repositories";
import { EpisodeHistoryEntry, EpisodeHistoryEntryEntity, assertIsEpisodeHistoryEntryEntity, episodeHistoryListEntitySchema, episodeHistoryEntryEntitySchema, episodeHistoryEntrySchema, episodeHistoryEntryToEntity, getIdFromEntry } from "../models";
import { LastTimePlayedService } from "../last-time-played.service";

namespace Dto {
  export class GetManyEntriesByIdBody
    extends createZodDto(episodeHistoryListRestDto.getManyEntriesBySuperId.reqBodySchema) {}
  export class GetManyEntriesByCriteriaBody
    extends createZodDto(episodeHistoryListRestDto.getManyEntriesByCriteria.reqBodySchema) {}
  export class GetOneByIdParams
    extends createZodDto(episodeHistoryListRestDto.getOneByIdReqParamsSchema) {}
  export class GetManyEntriesByIdParams
    extends createZodDto(episodeHistoryListRestDto.getOneByIdReqParamsSchema) {}
  export class DeleteOneEntryByIdParams
    extends createZodDto(episodeHistoryListRestDto.deleteOneEntryById.reqParamsSchema) {}
};

@Controller()
export class EpisodeHistoryListRestController
implements
    CanGetAll<Request, Response> {
  constructor(
    private historyListRepository: EpisodeHistoryListRepository,
    private serieRepository: SerieRepository,
    private episodeRepository: EpisodeRepository,
    private lastTimePlayedService: LastTimePlayedService,
  ) {
  }

  @GetMany("/", episodeHistoryListEntitySchema)
  async getAll() {
    return await this.historyListRepository.getAll();
  }

  @GetOne("/:id", episodeHistoryListEntitySchema)
  async getOneById(
    @Param() params: Dto.GetOneByIdParams,
  ) {
    const got = await this.historyListRepository.getOneByIdOrCreate(params.id);

    assertFound(got);

    return got;
  }

  @GetMany("/:id/entries", episodeHistoryEntrySchema)
  async getManyEntriesByHistoryListId(
    @Param() params: Dto.GetOneByIdParams,
  ) {
    const got = await this.historyListRepository.getOneByIdOrCreate(params.id);

    assertFound(got);

    return got.entries;
  }

  async #getEntriesWithCriteriaApplied(
    entries: EpisodeHistoryEntryEntity[],
    body: Dto.GetManyEntriesByIdBody = {},
  ): Promise<EpisodeHistoryEntryEntity[]> {
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
      const descSort = (
        a: EpisodeHistoryEntry,
        b: EpisodeHistoryEntry,
      ) => b.date.timestamp - a.date.timestamp;
      const ascSort = (
        a: EpisodeHistoryEntry,
        b: EpisodeHistoryEntry,
      ) => a.date.timestamp - b.date.timestamp;

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

  @GetManyCriteria("/:id/entries/search", episodeHistoryEntryEntitySchema)
  async getManyEntriesByHistoryListIdSearch(
    @Body() body: Dto.GetManyEntriesByIdBody,
    @Param() params: Dto.GetManyEntriesByIdParams,
  ) {
    const got = await this.historyListRepository.getOneByIdOrCreate(params.id);

    assertFound(got);
    let entries = got.entries.map(e=>episodeHistoryEntryToEntity(e, got));

    entries = await this.#getEntriesWithCriteriaApplied(entries, body);

    return entries;
  }

  @GetManyCriteria("/entries/search", episodeHistoryEntryEntitySchema)
  async getManyEntriesBySearch(
    @Body() body: Dto.GetManyEntriesByCriteriaBody,
  ) {
    const got = await this.historyListRepository.getAll();
    let entries: EpisodeHistoryEntryEntity[] = [];

    for (const historyList of got)
      entries.push(...historyList.entries.map(e=>episodeHistoryEntryToEntity(e, historyList)));

    entries = await this.#getEntriesWithCriteriaApplied(entries, body);

    return entries;
  }

  @DeleteOne("/:id/entries/:entryId", episodeHistoryEntryEntitySchema)
  async deleteOneEntryByIdAndGet(
    @Param() params: Dto.DeleteOneEntryByIdParams,
  ): Promise<EpisodeHistoryEntryEntity> {
    const { id, entryId } = params;
    const historyList = await this.historyListRepository.getOneByIdOrCreate(id);

    assertFound(historyList);

    // eslint-disable-next-line max-len
    // TODO: igual ejecutar esto en paralelo, usando el índice, hace que elimine índices que no toca.
    const entryIndex = historyList.entries.findIndex(
      (entry: EpisodeHistoryEntry) => getIdFromEntry(entry) === entryId,
    );
    const found = entryIndex > 0 ? true : undefined;

    assertFound(found);

    const [deleted] = historyList.entries.splice(entryIndex, 1);

    assertIsEpisodeHistoryEntryEntity(deleted);

    await this.historyListRepository.updateOneById(historyList.id, historyList);

    this.lastTimePlayedService.updateEpisodeLastTimePlayedFromEntriesAndGet( {
      episodeId: deleted.episodeId,
      entries: historyList.entries,
    } ).catch(showError);

    return deleted;
  }
}
