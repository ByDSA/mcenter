import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { MusicInfoCrudDtos } from "$shared/models/musics/user-info/dto/transport";
import { MusicEntity, musicEntitySchema, musicUserInfoEntitySchema } from "#musics/models";
import { AdminDeleteOne, GetManyCriteria, GetOne, GetOneCriteria, UserPatchOne } from "#utils/nestjs/rest";
import { User } from "#core/auth/users/User.decorator";
import { MusicsUsersRepository } from "./repositories/user-info/repository";
import { MusicsRepository } from "./repositories/music";

class GetOneByIdParamsDto extends createZodDto(MusicCrudDtos.GetOne.ById.paramsSchema) {}
class GetManyByCriteriaDto extends createZodDto(MusicCrudDtos.GetMany.criteriaSchema) {}
class GetManyOneByCriteriaDto extends createZodDto(MusicCrudDtos.GetOne.criteriaSchema) {}
class PatchParamsDto extends createZodDto(MusicCrudDtos.PatchOneById.paramsSchema) {}
class DeleteOneParamsDto extends createZodDto(MusicCrudDtos.DeleteOneById.paramsSchema) {}
class PatchBodyDto extends createZodDto(MusicCrudDtos.PatchOneById.bodySchema) {}

class PatchUserInfoBodyDto extends createZodDto(MusicInfoCrudDtos.PatchOneById.bodySchema) {}

@Controller("/")
export class MusicCrudController {
  constructor(
    private readonly musicRepo: MusicsRepository,
    private readonly musicsUsersrepo: MusicsUsersRepository,
  ) {
  }

  @GetManyCriteria("/search", musicEntitySchema)
  async getManyByCriteria(
    @Body() criteria: GetManyByCriteriaDto,
    @User() user: UserPayload | null,
  ): Promise<MusicEntity[]> {
    return await this.musicRepo.getMany( {
      criteria,
      requestingUserId: user?.id,
    } );
  }

  @UserPatchOne(":id", musicEntitySchema)
  async patchOneByIdAndGet(
    @Param() params: DeleteOneParamsDto,
    @Body() body: PatchBodyDto,
    @User() user: UserPayload,
  ) {
    const { id } = params;

    // TODO: filtro por uploader
    return await this.musicRepo.patchOneByIdAndGet(id, body);
  }

  @UserPatchOne(":id/user-info", musicUserInfoEntitySchema)
  async patchOneUserInfoByKeyAndGet(
    @Param() params: PatchParamsDto,
    @Body() body: PatchUserInfoBodyDto,
    @User() user: UserPayload,
  ) {
    return await this.musicsUsersrepo.patchOneByIdAndGet( {
      musicId: params.id,
      userId: user.id,
    }, body);
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

  @GetOneCriteria(MusicCrudDtos.GetOne.responseDataSchema)
  async getOneCriteria(
    @Body() criteria: GetManyOneByCriteriaDto,
    @User() user: UserPayload | null,
  ): Promise<MusicEntity | null> {
    return await this.musicRepo.getOne( {
      criteria,
      requestingUserId: user?.id,
    } );
  }
}
