import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Query, Req } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { MusicInfoCrudDtos } from "$shared/models/musics/user-info/dto/transport";
import { Request } from "express";
import { MusicEntity,
  musicEntitySchema,
  musicUserInfoEntitySchema } from "#musics/models";
import { AdminDeleteOne,
  GetManyCriteria,
  GetOneCriteria,
  UserPatchOne } from "#utils/nestjs/rest";
import { User } from "#core/auth/users/User.decorator";
import { IdParamDto } from "#utils/validation/dtos";
import { TokenAuth } from "#core/auth/strategies/token/decorator";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { MusicFlowService } from "../MusicFlow.service";
import { RenderMusic } from "../renderer/renderer.interceptor";
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

class BulkPatchBodyDto extends createZodDto(
  MusicCrudDtos.BulkPatch.bodySchema,
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

  // Necesario bulk antes del patch normal por visibilidad de urls
  @Authenticated()
  @Patch("/bulk")
  // @ValidateResponseWithZodSchema(MusicCrudDtos.BulkPatch.responseSchema)
  @HttpCode(HttpStatus.OK)
  async bulkPatch(
    @Body() body: BulkPatchBodyDto,
    @User() user: UserPayload,
  ): Promise<MusicCrudDtos.BulkPatch.Return> {
    const { ids, music, userInfo } = body;
    const results: MusicEntity[] = [];
    const warnings: MusicCrudDtos.BulkPatch.Warning[] = [];

    if (music) {
      const { data: patched, warnings: musicWarnings } = await this.musicRepo
        .patchManyByIds(ids, music);

      results.push(...patched);
      warnings.push(...musicWarnings);
    }

    if (userInfo) {
      const { warnings: userInfoWarnings } = await this.musicsUsersrepo
        .patchManyByMusicIds(ids, user.id, userInfo);

      warnings.push(...userInfoWarnings);

      // Si no se han devuelto ya las entidades desde music, buscamos las musics
      if (!music) {
        const patched = await Promise.all(
          ids.map((id) => this.musicRepo.getOneById(id)),
        );

        results.push(...(patched.filter(Boolean) as MusicEntity[]));
      }
    }

    return {
      data: results,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
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

  @RenderMusic( {
    json: true,
    raw: true,
    m3u8: true,
  } )
  @TokenAuth()
  @Get("/:id")
  async getOneById(
    @Param() params: IdParamDto,
    @Req() req: Request,
    @User() user: UserPayload | null,
    @Query("skip-history") shouldNotAddToHistory: string | undefined,
  ) {
    const { id } = params;

    return await this.flow.validateParamsAndFetchMusicAndUpdateHistory(
      (_format) => {
        return this.musicRepo.getOneById(id);
      },
      {
        req,
        user,
        shouldNotAddToHistory: !!shouldNotAddToHistory,
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
