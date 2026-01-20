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
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { User } from "#core/auth/users/User.decorator";
import { UserDeleteOne,
  UserPatchOne,
  UserPost,
  GetManyCriteria,
  GetOneCriteria } from "#utils/nestjs/rest";
import { assertFoundClient } from "#utils/validation/found";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { musicSmartPlaylistEntitySchema } from "../models";
import { MusicSmartPlaylistRepository } from "./repository/repository";

class CreateBody extends createZodDto(
  MusicSmartPlaylistCrudDtos.CreateOne.bodySchema,
) {}
class PatchBody extends createZodDto(
  MusicSmartPlaylistCrudDtos.PatchOneById.bodySchema,
) {}
class GetManyBody extends createZodDto(
  MusicSmartPlaylistCrudDtos.GetMany.criteriaSchema,
) {}
class IdParam extends createZodDto(
  z.object( {
    id: mongoDbId,
  } ),
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
    private readonly usersRepo: UsersRepository,
  ) {}

  @Get("/:id")
  async getOne(
    @Param() params: IdParam,
    @User() user: UserPayload | null,
    @Query("token") token: string | undefined,
  ) {
    mongoDbId.or(z.undefined()).parse(token);
    const userId = user?.id ?? token;
    const query = await this.repo.getOneById(params.id);

    assertFoundClient(query);

    // Validar visibilidad
    if (query.visibility === "private" && query.ownerUserId !== userId)
      throw new UnauthorizedException();

    return query;
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

    const query = await this.repo.getOneByCriteria( {
      filter: {
        ownerUserSlug: params.userSlug,
        slug: params.querySlug,
      },
    } );

    assertFoundClient(query);

    return query;
  }

  @Authenticated()
  @UserPost("/", musicSmartPlaylistEntitySchema)
  async createOne(@Body() body: CreateBody, @User() user: UserPayload) {
    return await this.repo.createOneAndGet(body, user.id);
  }

  @Authenticated()
  @UserPatchOne("/:id", musicSmartPlaylistEntitySchema)
  async patchOne(
    @Param() params: IdParam,
    @Body() body: PatchBody,
    @User() user: UserPayload,
  ) {
    await this.repo.guardOwner(user.id, params.id);

    return await this.repo.patchOneByIdAndGet(params.id, body);
  }

  @Authenticated()
  @UserDeleteOne("/:id", musicSmartPlaylistEntitySchema)
  async deleteOne(@Param() params: IdParam, @User() user: UserPayload) {
    await this.repo.guardOwner(user.id, params.id);

    return await this.repo.deleteOneByIdAndGet(params.id);
  }

  @GetOneCriteria(musicSmartPlaylistEntitySchema, {
    url: "/search-one",
  } )
  async getOneByCriteria(@Body() body: GetOneByCriteriaBody) {
    return await this.repo.getOneByCriteria(body);
  }

  @GetManyCriteria("/criteria", musicSmartPlaylistEntitySchema)
  async getManyByCriteria(@Body() body: GetManyBody) {
    return await this.repo.getManyByCriteria(body);
  }

  private async guardVisibilityBySlugs( { smartPlaylistSlug: querySlug,
    requestUserId,
    userSlug }: GuardVisibilityBySlugProps) {
    const query = await this.repo.getOneByCriteria( {
      filter: {
        slug: querySlug,
        ownerUserSlug: userSlug,
      },
    } );

    assertFoundClient(query);

    if (query.visibility === "private" && query.ownerUserId !== requestUserId)
      throw new UnauthorizedException();
  }
}
