import { Request, Response } from "express";
import { Body, Controller, Param } from "@nestjs/common";
import { showError } from "$shared/utils/errors/showError";
import { createZodDto } from "nestjs-zod";
import { episodeHistoryEntriesRestDto } from "$shared/models/episodes/history/dto/transport";
import z from "zod";
import { EpisodeHistoryEntriesRepository } from "../repositories";
import { EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema } from "../models";
import { LastTimePlayedService } from "../last-time-played.service";
import { CanGetAll } from "#utils/layers/controller";
import { DeleteOne } from "#utils/nestjs/rest";
import { GetMany, GetManyCriteria } from "#utils/nestjs/rest/Get";

namespace Dto {
  export class GetManyEntriesByCriteriaBody
    extends createZodDto(episodeHistoryEntriesRestDto.getManyByCriteria.reqBodySchema) {}
  export class SerieIdParams
    extends createZodDto(z.object( {
      serieId: z.string(),
    } )) {}

    export class IdParams extends createZodDto(z.object( {
      id: z.string(),
    } )) {}
};

@Controller()
export class EpisodeHistoryEntriesRestController
implements
    CanGetAll<Request, Response> {
  constructor(
    private readonly entriesRepository: EpisodeHistoryEntriesRepository,
    private readonly lastTimePlayedService: LastTimePlayedService,
  ) {
  }

  @GetMany("/", episodeHistoryEntryEntitySchema)
  async getAll() {
    return await this.entriesRepository.getAll();
  }

  @GetMany("/:serieId", episodeHistoryEntryEntitySchema)
  async getManyBySerieId(
    @Param() params: Dto.SerieIdParams,
  ) {
    return await this.entriesRepository.getManyBySerieId(params.serieId);
  }

  @GetMany("/:serieId/entries", episodeHistoryEntryEntitySchema)
  async getAllEntriesBySerieId(
    @Param() params: Dto.SerieIdParams,
  ) {
    return await this.entriesRepository.getManyByCriteria( {
      filter: {
        serieId: params.serieId,
      },
    } );
  }

  @GetManyCriteria("/:serieId/entries/search", episodeHistoryEntryEntitySchema)
  async getManyEntriesBySerieAndCriteria(
    @Body() body: Dto.GetManyEntriesByCriteriaBody,
    @Param() params: Dto.SerieIdParams,
  ) {
    return await this.entriesRepository.getManyByCriteria( {
      ...body,
      filter: {
        ...body.filter,
        serieId: params.serieId,
      },
    } );
  }

  @GetManyCriteria("/entries/search", episodeHistoryEntryEntitySchema)
  async getManyEntriesByCriteria(
    @Body() body: Dto.GetManyEntriesByCriteriaBody,
  ) {
    return await this.entriesRepository.getManyByCriteria(body);
  }

  @DeleteOne("/entries/:id", episodeHistoryEntryEntitySchema)
  async deleteOneEntryByIdAndGet(
    @Param() params: Dto.IdParams,
  ): Promise<EpisodeHistoryEntryEntity> {
    const { id } = params;
    const deleted = await this.entriesRepository.deleteOneByIdAndGet(id);

    this.lastTimePlayedService.updateEpisodeLastTimePlayed(deleted.episodeId).catch(showError);

    return deleted;
  }
}
