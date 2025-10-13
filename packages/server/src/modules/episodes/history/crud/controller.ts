import type { CanGetAll } from "#utils/layers/controller";
import { Request, Response } from "express";
import { Body, Controller, Inject, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { EpisodeHistoryEntryCrudDtos } from "$shared/models/episodes/history/dto/transport";
import z from "zod";
import { AdminDeleteOne, GetMany, GetManyCriteria } from "#utils/nestjs/rest";
import { showError } from "#core/logging/show-error";
import { type EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema } from "../models";
import { LastTimePlayedService } from "../last-time-played.service";
import { EpisodeHistoryRepository } from "./repository";

class GetManyByCriteriaBodyDto
  extends createZodDto(EpisodeHistoryEntryCrudDtos.GetManyByCriteria.criteriaSchema) {}

class SeriesKeyParamsDto extends createZodDto(
  z.object( {
    seriesKey: z.string(),
  } ),
) {}

class IdParamsDto extends createZodDto(
  z.object( {
    id: z.string(),
  } ),
) {}

@Controller()
export class EpisodeHistoryCrudController
implements
    CanGetAll<Request, Response> {
  constructor(
    private readonly entriesRepo: EpisodeHistoryRepository,
    @Inject(LastTimePlayedService)
    private readonly lastTimePlayedService: LastTimePlayedService,
  ) {
  }

  @GetMany("/", episodeHistoryEntryEntitySchema)
  async getAll() {
    return await this.entriesRepo.getAll();
  }

  @GetMany("/:seriesKey", episodeHistoryEntryEntitySchema)
  async getManyBySeriesKey(
    @Param() params: SeriesKeyParamsDto,
  ) {
    return await this.entriesRepo.getManyBySeriesKey(params.seriesKey);
  }

  @GetMany("/:seriesKey/entries", episodeHistoryEntryEntitySchema)
  async getAllEntriesByseriesKey(
    @Param() params: SeriesKeyParamsDto,
  ) {
    return await this.entriesRepo.getManyByCriteria( {
      filter: {
        seriesKey: params.seriesKey,
      },
    } );
  }

  @GetManyCriteria("/:seriesKey/entries/search", episodeHistoryEntryEntitySchema)
  async getManyEntriesBySerieAndCriteria(
    @Body() body: GetManyByCriteriaBodyDto,
    @Param() params: SeriesKeyParamsDto,
  ) {
    return await this.entriesRepo.getManyByCriteria( {
      ...body,
      filter: {
        ...body.filter,
        seriesKey: params.seriesKey,
      },
    } );
  }

  @GetManyCriteria("/entries/search", episodeHistoryEntryEntitySchema)
  async getManyEntriesByCriteria(
    @Body() body: GetManyByCriteriaBodyDto,
  ) {
    return await this.entriesRepo.getManyByCriteria(body);
  }

  @AdminDeleteOne("/entries/:id", episodeHistoryEntryEntitySchema)
  async deleteOneEntryByIdAndGet(
    @Param() params: IdParamsDto,
  ): Promise<EpisodeHistoryEntryEntity> {
    const { id } = params;
    const deleted = await this.entriesRepo.deleteOneByIdAndGet(id);

    this.lastTimePlayedService.updateEpisodeLastTimePlayedByCompKey(deleted.resourceId)
      .catch(showError);

    return deleted;
  }
}
