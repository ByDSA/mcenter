import { Body,
  Controller,
  Get,
  Param,
  Query,
  UnauthorizedException } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
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
import { musicSmartPlaylistEntitySchema } from "../models";
import { MusicSmartPlaylistRepository } from "./repository/repository";

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
  ) {}

  @GetOneById(musicSmartPlaylistEntitySchema)
  async getOne(
    @Param() params: IdParamDto,
    @User() user: UserPayload | null,
    @Query("token") token: string | undefined,
  ) {
    mongoDbId.or(z.undefined()).parse(token);
    const userId = user?.id ?? token;
    const smartPlaylist = await this.repo.getOneById(params.id);

    assertFoundClient(smartPlaylist);

    // Validar visibilidad
    if (smartPlaylist.visibility === "private" && smartPlaylist.ownerUserId !== userId)
      throw new UnauthorizedException();

    return smartPlaylist;
  }

  @Get("/user/:userSlug/:querySlug")
  async getOneUserQuery(
    @Param() params: GetOneUserQueryParams,
    @User() user: UserPayload | null,
    @Query("token") token: string | undefined,
  ) {
    mongoDbId.or(z.undefined()).parse(token);
    const userId = user?.id ?? token;

    await this.guardVisibilityBySlugs( {
      requestUserId: userId,
      userSlug: params.userSlug,
      smartPlaylistSlug: params.querySlug,
    } );

    const smartPlaylist = await this.repo.getOneByCriteria( {
      filter: {
        ownerUserSlug: params.userSlug,
        slug: params.querySlug,
      },
    } );

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
  async patchOne(
    @Param() params: IdParamDto,
    @Body() body: PatchBody,
    @User() user: UserPayload,
  ) {
    await this.repo.guardOwner(user.id, params.id);

    return await this.repo.patchOneByIdAndGet(params.id, body);
  }

  @UserDeleteOne(musicSmartPlaylistEntitySchema)
  async deleteOne(@Param() params: IdParamDto, @User() user: UserPayload) {
    await this.repo.guardOwner(user.id, params.id);

    return await this.repo.deleteOneByIdAndGet(params.id);
  }

  @GetOneCriteria(musicSmartPlaylistEntitySchema)
  async getOneByCriteria(@Body() body: GetOneByCriteriaBody) {
    return await this.repo.getOneByCriteria(body);
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

    if (smartPlaylist.visibility === "private" && smartPlaylist.ownerUserId !== requestUserId)
      throw new UnauthorizedException();
  }
}
