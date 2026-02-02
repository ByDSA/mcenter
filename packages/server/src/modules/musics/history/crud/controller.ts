import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { UserPayload } from "$shared/models/auth";
import { MusicHistoryEntryCrudDtos } from "$shared/models/musics/history/dto/transport";
import { AdminDeleteOne, UserPost, UserCreateOne } from "#utils/nestjs/rest";
import { GetManyCriteria } from "#utils/nestjs/rest/crud/get";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { User } from "#core/auth/users/User.decorator";
import { IdParamDto } from "#utils/validation/dtos";
import { musicHistoryEntryEntitySchema } from "../models";
import { MusicHistoryRepository } from "./repository";

class GetManyBodyDto
  extends createZodDto(MusicHistoryEntryCrudDtos.GetMany.bodySchema) {}

class CreateOneEntryBodyDto
  extends createZodDto(MusicHistoryEntryCrudDtos.CreateOne.bodySchema) {}

class CreateManyEntriesBodyDto
  extends createZodDto(MusicHistoryEntryCrudDtos.CreateOne.bodySchema.array()) {}

const schema = musicHistoryEntryEntitySchema;

@Authenticated()
@Controller()
export class MusicHistoryCrudController {
  constructor(
    private readonly historyRepo: MusicHistoryRepository,
  ) {}

  @AdminDeleteOne(schema)
  async deleteOneByIdAndGet(
    @Param() params: IdParamDto,
  ) {
    // TODO: cambiar de admin a que sea del propio usuario que hace la request
    const { id } = params;
    const deleted = await this.historyRepo.deleteOneByIdAndGet(id);

    return deleted;
  }

  @GetManyCriteria(schema)
  async getManyEntriesBySearch(
    @Body() body: GetManyBodyDto,
    @User() user: UserPayload,
  ) {
    return await this.historyRepo.getManyByCriteria( {
      ...body,
      filter: {
        ...body.filter,
        userId: user.id,
      },
    } );
  }

  @UserCreateOne(schema)
  async createOneEntry(
    @Body() body: CreateOneEntryBodyDto,
    @User() user: UserPayload,
  ) {
    const date = buildDateObject(body.timestamp);

    return await this.historyRepo.createOneAndGet( {
      date,
      resourceId: body.musicId,
      userId: user.id,
    } );
  }

  // TODO: no se usa ??
  @UserPost("/create-many", schema)
  async createManyEntries(
    @Body() body: CreateManyEntriesBodyDto,
    @User() user: UserPayload,
  ) {
    const results = [];

    for (const entry of body) {
      const date = buildDateObject(entry.timestamp);
      const created = await this.historyRepo.createOneAndGet( {
        date,
        resourceId: entry.musicId,
        userId: user.id,
      } );

      results.push(created);
    }

    return results;
  }
}

const buildDateObject = (timestampInSecs?: number) => {
  const dateJs = timestampInSecs ? new Date(timestampInSecs * 1000) : new Date();
  const ts = timestampInSecs ?? Math.round(dateJs.getTime() / 1000);

  return {
    day: dateJs.getDate(),
    month: dateJs.getMonth() + 1,
    year: dateJs.getFullYear(),
    timestamp: ts,
  };
};
