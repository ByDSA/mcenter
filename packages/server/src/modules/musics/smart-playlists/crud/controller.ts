import { Body,
  Controller,
  Get,
  Param, UnauthorizedException } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { UserPayload } from "$shared/models/auth";
import { slugSchema } from "$shared/models/utils/schemas/slug";
import { MusicSmartPlaylistCrudDtos } from "$shared/models/musics/smart-playlists/dto/transport";
import { User } from "#core/auth/users/User.decorator";
import { UserDeleteOne,
  UserPatchOne,
  UserCreateOne,
  GetManyCriteria,
  GetOneCriteria,
  GetOneById } from "#utils/nestjs/rest";
import { assertFoundClient } from "#utils/validation/found";
import { IdParamDto } from "#utils/validation/dtos";
import { TokenAuth } from "#core/auth/strategies/token/decorator";
import { MusicSmartPlaylistEntity, musicSmartPlaylistEntitySchema } from "../models";
import { MusicSmartPlaylistRepository } from "./repository/repository";
import { GuardOwnerService } from "./guard-owner.service";

class CreateBody extends createZodDto(
  MusicSmartPlaylistCrudDtos.CreateOne.bodySchema,
) {}
class PatchBody extends createZodDto(
  MusicSmartPlaylistCrudDtos.Patch.bodySchema,
) {}
class GetManyBody extends createZodDto(
  MusicSmartPlaylistCrudDtos.GetMany.criteriaSchema,
) {}

class GetOneByCriteriaBody extends createZodDto(
  MusicSmartPlaylistCrudDtos.GetOne.criteriaSchema,
) {}

class GetOneUserQueryParams extends createZodDto(
  z.object( {
    userSlug: slugSchema,
    querySlug: slugSchema,
  } ),
) {}

type GuardVisibilityBySlugProps = {
  requestUserId: string | undefined;
  userSlug: string;
  smartPlaylistSlug: string;
};

@Controller()
export class SmartPlaylistCrudController {
  constructor(
    private readonly repo: MusicSmartPlaylistRepository,
    private readonly guardService: GuardOwnerService,
  ) {}

  @TokenAuth()
  @GetOneById(musicSmartPlaylistEntitySchema)
  async getOneById(
    @Param() params: IdParamDto,
    @User() user: UserPayload | null,
  ) {
    const userId = user?.id;
    const smartPlaylist = await this.repo.getOneById(params.id);

    if (!smartPlaylist)
      return null;

    // Validar visibilidad
    if (smartPlaylist.visibility === "private" && smartPlaylist.ownerUserId !== userId)
      throw new UnauthorizedException();

    return smartPlaylist;
  }

  @TokenAuth()
  @Get("/user/:userSlug/:querySlug")
  async getOneUserQuery(
    @Param() params: GetOneUserQueryParams,
    @User() user: UserPayload | null,
  ) {
    const userId = user?.id;
    let smartPlaylist: MusicSmartPlaylistEntity | null;

    try {
      await this.guardVisibilityBySlugs( {
        requestUserId: userId,
        userSlug: params.userSlug,
        smartPlaylistSlug: params.querySlug,
      } );

      smartPlaylist = await this.repo.getOneByCriteria( {
        filter: {
          ownerUserSlug: params.userSlug,
          slug: params.querySlug,
        },
      } );
      assertFoundClient(smartPlaylist);
    } catch {
      return null;
    }

    return musicSmartPlaylistEntitySchema.parse(smartPlaylist);
  }

  @UserCreateOne(musicSmartPlaylistEntitySchema)
  async createOne(
    @Body() body: CreateBody,
    @User() user: UserPayload,
  ) {
    return await this.repo.createOneAndGet(body, user.id);
  }

  @UserPatchOne(musicSmartPlaylistEntitySchema)
  async patchOneById(
    @Param() params: IdParamDto,
    @Body() body: PatchBody,
    @User() user: UserPayload,
  ) {
    await this.guardService.guardOwner(user.id, params.id);

    return await this.repo.patchOneByIdAndGet(params.id, body);
  }

  @UserDeleteOne(musicSmartPlaylistEntitySchema)
  async deleteOne(@Param() params: IdParamDto, @User() user: UserPayload) {
    await this.guardService.guardOwner(user.id, params.id);

    return await this.repo.deleteOneByIdAndGet(params.id);
  }

  @GetOneCriteria(musicSmartPlaylistEntitySchema)
  async getOneByCriteria(
    @Body() body: GetOneByCriteriaBody,
    @User() user: UserPayload | null,
  ) {
    const ret = await this.repo.getOneByCriteria(body);

    if (!ret)
      return null;

    this.guardVisibility(ret, user?.id);

    return ret;
  }

  @GetManyCriteria(musicSmartPlaylistEntitySchema)
  async getManyByCriteria(@Body() body: GetManyBody) {
    return await this.repo.getManyByCriteria(body);
  }

  private async guardVisibilityBySlugs( { smartPlaylistSlug,
    requestUserId,
    userSlug }: GuardVisibilityBySlugProps) {
    const smartPlaylist = await this.repo.getOneByCriteria( {
      filter: {
        slug: smartPlaylistSlug,
        ownerUserSlug: userSlug,
      },
    } );

    assertFoundClient(smartPlaylist);

    this.guardVisibility(smartPlaylist, requestUserId);
  }

  private guardVisibility(
    smartPlaylist: MusicSmartPlaylistEntity,
    requestUserId: string | undefined,
  ) {
    if (smartPlaylist.visibility === "private" && smartPlaylist.ownerUserId !== requestUserId)
      throw new UnauthorizedException();
  }
}
