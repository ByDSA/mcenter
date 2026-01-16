import { Body, Controller, Get, Param, Query, UnauthorizedException } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { UserPayload } from "$shared/models/auth";
import { MusicQueryCrudDtos } from "$shared/models/musics/queries/dto/transport";
import { slugSchema } from "$shared/models/utils/schemas/slug";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { User } from "#core/auth/users/User.decorator";
import { UserDeleteOne, UserPatchOne, UserPost, GetManyCriteria, GetOneCriteria } from "#utils/nestjs/rest";
import { assertFoundClient } from "#utils/validation/found";
import { UsersRepository } from "#core/auth/users/crud/repository";
import { musicQueryEntitySchema } from "../models";
import { MusicQueriesRepository } from "./repository/repository";

class CreateBody extends createZodDto(MusicQueryCrudDtos.CreateOne.bodySchema) {}
class PatchBody extends createZodDto(MusicQueryCrudDtos.PatchOneById.bodySchema) {}
class GetManyBody extends createZodDto(MusicQueryCrudDtos.GetMany.criteriaSchema) {}
class IdParam extends createZodDto(z.object( {
  id: mongoDbId,
} )) {}
class GetOneByCriteriaBody extends createZodDto(MusicQueryCrudDtos.GetOne.criteriaSchema) {}

class GetOneUserQueryParams extends createZodDto(z.object( {
  userSlug: slugSchema,
  querySlug: slugSchema,
} )) {}

type GuardVisibilityBySlugProps = {
  requestUserId: string | undefined;
  userSlug: string;
  querySlug: string;
};

@Controller()
export class QueriesCrudController {
  constructor(
    private readonly repo: MusicQueriesRepository,
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
      querySlug: params.querySlug,
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
  @UserPost("/", musicQueryEntitySchema)
  async createOne(
    @Body() body: CreateBody,
    @User() user: UserPayload,
  ) {
    return await this.repo.createOneAndGet(body, user.id);
  }

  @Authenticated()
  @UserPatchOne("/:id", musicQueryEntitySchema)
  async patchOne(
    @Param() params: IdParam,
    @Body() body: PatchBody,
    @User() user: UserPayload,
  ) {
    await this.repo.guardOwner(user.id, params.id);

    return await this.repo.patchOneByIdAndGet(params.id, {
      entity: body,
    } );
  }

  @Authenticated()
  @UserDeleteOne("/:id", musicQueryEntitySchema)
  async deleteOne(
    @Param() params: IdParam,
    @User() user: UserPayload,
  ) {
    await this.repo.guardOwner(user.id, params.id);

    return await this.repo.deleteOneByIdAndGet(params.id);
  }

  @GetOneCriteria(musicQueryEntitySchema, {
    url: "/search-one",
  } )
  async getOneByCriteria(
    @Body() body: GetOneByCriteriaBody,
  ) {
    return await this.repo.getOneByCriteria(body);
  }

  @GetManyCriteria("/criteria", musicQueryEntitySchema)
  async getManyByCriteria(
    @Body() body: GetManyBody,
  ) {
    return await this.repo.getManyByCriteria(body);
  }

  private async guardVisibilityBySlugs( { querySlug,
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
