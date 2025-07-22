import type { CanGetAll } from "#utils/layers/controller";
import { Request, Response } from "express";
import { Body, Controller, Inject, Param } from "@nestjs/common";
import { showError } from "$shared/utils/errors/showError";
import { createZodDto } from "nestjs-zod";
import { EpisodeHistoryEntryRestDtos } from "$shared/models/episodes/history/dto/transport";
import z from "zod";
import { DeleteOne, GetMany, GetManyCriteria } from "#utils/nestjs/rest";
import { EpisodeHistoryEntriesRepository } from "../repositories/repository";
import { type EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema } from "../models";
import { LastTimePlayedService } from "../last-time-played.service";

class GetManyByCriteriaBodyDto
  extends createZodDto(EpisodeHistoryEntryRestDtos.GetManyByCriteria.criteriaSchema) {}

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
export class EpisodeHistoryEntriesRestController
implements
    CanGetAll<Request, Response> {
  constructor(
    private readonly entriesRepository: EpisodeHistoryEntriesRepository,
    @Inject(LastTimePlayedService)
    private readonly lastTimePlayedService: LastTimePlayedService,
  ) {
  }

  @GetMany("/", episodeHistoryEntryEntitySchema)
  async getAll() {
    return await this.entriesRepository.getAll();
  }

  @GetMany("/:seriesKey", episodeHistoryEntryEntitySchema)
  async getManyByseriesKey(
    @Param() params: SeriesKeyParamsDto,
  ) {
    return await this.entriesRepository.getManyBySeriesKey(params.seriesKey);
  }

  @GetMany("/:seriesKey/entries", episodeHistoryEntryEntitySchema)
  async getAllEntriesByseriesKey(
    @Param() params: SeriesKeyParamsDto,
  ) {
    return await this.entriesRepository.getManyByCriteria( {
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
    return await this.entriesRepository.getManyByCriteria( {
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
    return await this.entriesRepository.getManyByCriteria(body);
  }

  @DeleteOne("/entries/:id", episodeHistoryEntryEntitySchema)
  async deleteOneEntryByIdAndGet(
    @Param() params: IdParamsDto,
  ): Promise<EpisodeHistoryEntryEntity> {
    const { id } = params;
    const deleted = await this.entriesRepository.deleteOneByIdAndGet(id);

    this.lastTimePlayedService
      .updateEpisodeLastTimePlayedByCompKey(deleted.episodeCompKey).catch(showError);

    return deleted;
  }
}
