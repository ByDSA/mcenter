import type { CanGetAll } from "#utils/layers/controller";
import { Request, Response } from "express";
import { Body, Controller, Inject, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { EpisodeHistoryEntryCrudDtos } from "$shared/models/episodes/history/dto/transport";
import z from "zod";
import { UserPayload } from "$shared/models/auth";
import { GET_MANY_CRITERIA_PATH } from "$shared/routing";
import { AdminDeleteOne, GetAll, GetManyCriteria } from "#utils/nestjs/rest";
import { showError } from "#core/logging/show-error";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { User } from "#core/auth/users/User.decorator";
import { type EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema } from "../models";
import { LastTimePlayedService } from "../last-time-played.service";
import { EpisodeHistoryRepository } from "./repository";

class GetManyBodyDto
  extends createZodDto(EpisodeHistoryEntryCrudDtos.GetMany.criteriaSchema) {}

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

@Authenticated()
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

  @GetAll(episodeHistoryEntryEntitySchema)
  async getAll() {
    return await this.entriesRepo.getAll();
  }

  @GetAll(episodeHistoryEntryEntitySchema, {
    url: "/:seriesKey",
  } )
  async getManyBySeriesKey(
    @Param() params: SeriesKeyParamsDto,
    @User() user: UserPayload,
  ) {
    return await this.entriesRepo.getManyBySeriesKey(user.id, params.seriesKey);
  }

  @GetAll(episodeHistoryEntryEntitySchema, {
    url: "/:seriesKey/entries",
  } )
  async getAllEntriesByseriesKey(
    @Param() params: SeriesKeyParamsDto,
    @User() user: UserPayload,
  ) {
    return await this.entriesRepo.getManyByCriteria( {
      filter: {
        seriesKey: params.seriesKey,
        userId: user.id,
      },
      expand: ["episodesSeries"],
    } );
  }

  @GetManyCriteria(episodeHistoryEntryEntitySchema, {
    url: "/:seriesKey/entries/" + GET_MANY_CRITERIA_PATH,
  } )
  async getManyEntriesBySerieAndCriteria(
    @Body() body: GetManyBodyDto,
    @Param() params: SeriesKeyParamsDto,
    @User() user: UserPayload,
  ) {
    return await this.entriesRepo.getManyByCriteria( {
      ...body,
      filter: {
        ...body.filter,
        userId: user.id,
        seriesKey: params.seriesKey,
      },
    } );
  }

  @GetManyCriteria(episodeHistoryEntryEntitySchema, {
    url: "/entries/" + GET_MANY_CRITERIA_PATH,
  } )
  async getManyEntriesByCriteria(
    @Body() body: GetManyBodyDto,
    @User() user: UserPayload,
  ) {
    return await this.entriesRepo.getManyByCriteria( {
      ...body,
      filter: {
        ...body.filter,
        userId: user.id,
      },
    } );
  }

  @AdminDeleteOne(episodeHistoryEntryEntitySchema, {
    url: "/entries/:id",
  } )
  async deleteOneEntryByIdAndGet(
    @Param() params: IdParamsDto,
  ): Promise<EpisodeHistoryEntryEntity> {
    const { id } = params;
    const deleted = await this.entriesRepo.deleteOneByIdAndGet(id);

    this.lastTimePlayedService.updateEpisodeLastTimePlayedById(deleted.userId, deleted.resourceId)
      .catch(showError);

    return deleted;
  }
}
