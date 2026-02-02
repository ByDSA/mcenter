import { Body, Controller, Get, Param, Query, Req, Res } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { MusicInfoCrudDtos } from "$shared/models/musics/user-info/dto/transport";
import { Response, Request } from "express";
import { MusicEntity,
  musicEntitySchema,
  musicUserInfoEntitySchema } from "#musics/models";
import { AdminDeleteOne,
  GetManyCriteria,
  GetOneCriteria,
  UserPatchOne } from "#utils/nestjs/rest";
import { User } from "#core/auth/users/User.decorator";
import { IdParamDto } from "#utils/validation/dtos";
import { MusicFlowService } from "../MusicFlow.service";
import { MusicsUsersRepository } from "./repositories/user-info/repository";
import { MusicsRepository } from "./repositories/music";

class GetManyBodyDto extends createZodDto(
  MusicCrudDtos.GetMany.criteriaSchema,
) {}
class GetManyOneByCriteriaDto extends createZodDto(
  MusicCrudDtos.GetOne.criteriaSchema,
) {}
class PatchBodyDto extends createZodDto(
  MusicCrudDtos.Patch.bodySchema,
) {}

class PatchUserInfoBodyDto extends createZodDto(
  MusicInfoCrudDtos.Patch.bodySchema,
) {}

@Controller("/")
export class MusicCrudController {
  constructor(
    private readonly musicRepo: MusicsRepository,
    private readonly musicsUsersrepo: MusicsUsersRepository,
    private readonly flow: MusicFlowService,
  ) {}

  @GetManyCriteria(musicEntitySchema)
  async getManyByCriteria(
    @Body() criteria: GetManyBodyDto,
    @User() user: UserPayload | null,
  ): Promise<MusicEntity[]> {
    return await this.musicRepo.getMany( {
      criteria,
      requestingUserId: user?.id,
    } );
  }

  @UserPatchOne(musicEntitySchema)
  async patchOneByIdAndGet(
    @Param() params: IdParamDto,
    @Body() body: PatchBodyDto,
    @User() _user: UserPayload,
  ) {
    const { id } = params;

    // TODO: filtro por uploader
    return await this.musicRepo.patchOneByIdAndGet(id, body);
  }

  @UserPatchOne(musicUserInfoEntitySchema, {
    url: ":id/user-info",
  } )
  async patchOneUserInfoByKeyAndGet(
    @Param() params: IdParamDto,
    @Body() body: PatchUserInfoBodyDto,
    @User() user: UserPayload,
  ) {
    return await this.musicsUsersrepo.patchOneByIdAndGet(
      {
        musicId: params.id,
        userId: user.id,
      },
      body,
    );
  }

  @AdminDeleteOne(musicEntitySchema)
  async deleteOneByIdAndGet(
    @Param() params: IdParamDto,
  ) {
    const { id } = params;

    // TODO: filtro por uploader
    return await this.musicRepo.deleteOneByIdAndGet(id);
  }

  @Get("/:id")
  async getOneById(
    @Param() params: IdParamDto,
    @Res( {
      passthrough: true,
    } )
      res: Response,
    @Req() req: Request,
    @User() user: UserPayload | null,
    @Query("token") token: string | undefined,
    @Query("skip-history") shouldNotAddToHistory: string | undefined,
  ) {
    const { id } = params;

    return await this.flow.fetchAndRender(
      (_format) => {
        return this.musicRepo.getOneById(id);
      },
      {
        req,
        res,
        user,
        shouldNotAddToHistory: !!shouldNotAddToHistory,
        token,
      },
    );
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
