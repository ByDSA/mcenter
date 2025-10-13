import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { UserPayload } from "$shared/models/auth";
import { MusicHistoryEntryCrudDtos } from "$shared/models/musics/history/dto/transport";
import { AdminDeleteOne } from "#utils/nestjs/rest";
import { GetManyCriteria } from "#utils/nestjs/rest/crud/get";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { User } from "#core/auth/users/User.decorator";
import { musicHistoryEntryEntitySchema } from "../models";
import { MusicHistoryRepository } from "./repository";

class GetManyByCriteriaBodyDto
  extends createZodDto(MusicHistoryEntryCrudDtos.GetManyByCriteria.bodySchema) {}
class DeleteOneByIdParamsDto
  extends createZodDto(MusicHistoryEntryCrudDtos.DeleteOneById.paramsSchema) {}

const schema = musicHistoryEntryEntitySchema;

@Controller()
export class MusicHistoryCrudController {
  constructor(
    private readonly historyRepo: MusicHistoryRepository,
  ) {}

  @AdminDeleteOne("/:id", schema)
  async deleteOneByIdAndGet(
    @Param() params: DeleteOneByIdParamsDto,
  ) {
    const { id } = params;
    const deleted = await this.historyRepo.deleteOneByIdAndGet(id);

    return deleted;
  }

  @Authenticated()
  @GetManyCriteria("/search", schema)
  async getManyEntriesBySearch(
    @Body() body: GetManyByCriteriaBodyDto,
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
}
