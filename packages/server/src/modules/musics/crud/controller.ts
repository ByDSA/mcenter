import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { MusicEntity, musicEntitySchema } from "#musics/models";
import { AdminDeleteOne, GetManyCriteria, GetOne, AdminPatchOne } from "#utils/nestjs/rest";
import { User } from "#core/auth/users/User.decorator";
import { MusicsRepository } from "./repository";

class GetOneByIdParamsDto extends createZodDto(MusicCrudDtos.GetOne.ById.paramsSchema) {}
class GetManyByCriteriaDto extends createZodDto(MusicCrudDtos.GetMany.criteriaSchema) {}
class PatchParamsDto extends createZodDto(MusicCrudDtos.PatchOneById.paramsSchema) {}
class DeleteOneParamsDto extends createZodDto(MusicCrudDtos.DeleteOneById.paramsSchema) {}
class PatchBodyDto extends createZodDto(MusicCrudDtos.PatchOneById.bodySchema) {}

@Controller("/")
export class MusicCrudController {
  constructor(
    private readonly musicRepo: MusicsRepository,
  ) {
  }

  @GetManyCriteria("/search", musicEntitySchema)
  async getManyByCriteria(
    @Body() criteria: GetManyByCriteriaDto,
  ): Promise<MusicEntity[]> {
    return await this.musicRepo.getManyByCriteria(criteria);
  }

  @AdminPatchOne(":id", musicEntitySchema)
  async patchOneByIdAndGet(
    @Param() params: DeleteOneParamsDto,
    @Body() body: PatchBodyDto,
    @User() user: UserPayload,
  ) {
    const { id } = params;

    // TODO: filtro por uploader
    return await this.musicRepo.patchOneByIdAndGet(id, body, {
      userId: user.id,
    } );
  }

  @AdminDeleteOne(":id", musicEntitySchema)
  async deleteOneByIdAndGet(
    @Param() params: PatchParamsDto,
  ) {
    const { id } = params;

    // TODO: filtro por uploader
    return await this.musicRepo.deleteOneByIdAndGet(id);
  }

  @GetOne("/:id", musicEntitySchema)
  async getOneById(
    @Param() params: GetOneByIdParamsDto,
  ): Promise<MusicEntity | null> {
    const { id } = params;

    return await this.musicRepo.getOneById(id);
  }
}
