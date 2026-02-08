import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { EpisodeHistoryEntryCrudDtos } from "$shared/models/episodes/history/dto/transport";
import z from "zod";
import { UserPayload } from "$shared/models/auth";
import { GET_MANY_CRITERIA_PATH } from "$shared/routing";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { GetAll, GetManyCriteria, UserDeleteOne } from "#utils/nestjs/rest";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { User } from "#core/auth/users/User.decorator";
import { type EpisodeHistoryEntryEntity, episodeHistoryEntryEntitySchema } from "../models";
import { EpisodeHistoryRepository } from "./repository";

class GetManyBodyDto
  extends createZodDto(EpisodeHistoryEntryCrudDtos.GetMany.criteriaSchema) {}

class SeriesIdParamsDto extends createZodDto(
  z.object( {
    seriesId: mongoDbId,
  } ),
) {}

class IdParamsDto extends createZodDto(
  z.object( {
    id: z.string(),
  } ),
) {}

@Authenticated()
@Controller()
export class EpisodeHistoryCrudController {
  constructor(
    private readonly entriesRepo: EpisodeHistoryRepository,
  ) {
  }

  @GetAll(episodeHistoryEntryEntitySchema)
  async getAll(
    @User() user: UserPayload,
  ) {
    return await this.entriesRepo.getAll( {
      requestingUserId: user.id,
    } );
  }

  @GetAll(episodeHistoryEntryEntitySchema, {
    url: "/:seriesId",
  } )
  async getManyBySeriesId(
    @Param() params: SeriesIdParamsDto,
    @User() user: UserPayload,
  ) {
    return await this.entriesRepo.getManyBySeriesId(params.seriesId, {
      requestingUserId: user.id,
    } );
  }

  @GetAll(episodeHistoryEntryEntitySchema, {
    url: "/:seriesId/entries",
  } )
  async getAllEntriesBySeriesId(
    @Param() params: SeriesIdParamsDto,
    @User() user: UserPayload,
  ) {
    return await this.entriesRepo.getManyByCriteria( {
      filter: {
        seriesId: params.seriesId,
      },
      expand: ["episodesSeries"],
    }, {
      requestingUserId: user.id,
    } );
  }

  @GetManyCriteria(episodeHistoryEntryEntitySchema, {
    url: "/:seriesId/entries/" + GET_MANY_CRITERIA_PATH,
  } )
  async getManyEntriesBySerieAndCriteria(
    @Body() body: GetManyBodyDto,
    @Param() params: SeriesIdParamsDto,
    @User() user: UserPayload,
  ) {
    return await this.entriesRepo.getManyByCriteria( {
      ...body,
      filter: {
        ...body.filter,
        seriesId: params.seriesId,
      },
    }, {
      requestingUserId: user.id,
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
      },
    }, {
      requestingUserId: user.id,
    } );
  }

  @UserDeleteOne(episodeHistoryEntryEntitySchema, {
    url: "/entries/:id",
  } )
  async deleteOneEntryByIdAndGet(
    @Param() params: IdParamsDto,
    @User() user: UserPayload,
  ): Promise<EpisodeHistoryEntryEntity> {
    const { id } = params;
    const deleted = await this.entriesRepo.deleteOneByIdAndGet(id, {
      requestingUserId: user.id,
    } );

    return deleted;
  }
}
