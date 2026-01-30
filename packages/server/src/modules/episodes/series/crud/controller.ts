import { Body, Controller, Get, HttpCode, HttpStatus, Param, UseInterceptors } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { UserPayload } from "$shared/models/auth";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import { SeriesCrudDtos } from "$shared/models/episodes/series/dto/transport";
import { createOneResultResponseSchema } from "$shared/utils/http/responses";
import { UserPost, UserPatchOne, AdminDeleteOne, GetMany, GetManyCriteria, GetOne } from "#utils/nestjs/rest";
import { User } from "#core/auth/users/User.decorator";
import { ResponseFormatterInterceptor } from "#utils/nestjs/rest/responses/response-formatter.interceptor";
import { ValidateResponseWithZodSchema } from "#utils/validation/zod-nestjs";
import { episodesBySeasonSchema } from "#episodes/models";
import { seriesEntitySchema } from "../models";
import { SeriesRepository } from "./repository";

class CreateBody extends createZodDto(SeriesCrudDtos.CreateOne.bodySchema) {}
class PatchBody extends createZodDto(SeriesCrudDtos.PatchOneById.bodySchema) {}
class GetManyBody extends createZodDto(SeriesCrudDtos.GetManyByCriteria.criteriaSchema) {}
class IdParam extends createZodDto(z.object( {
  id: mongoDbId,
} )) {}

// TODO: patch/create sólo uploaders
@Controller("/")
export class SeriesCrudController {
  constructor(
    private readonly repo: SeriesRepository,
  ) {}

  @GetMany("/", seriesEntitySchema)
  async getAll() {
    return await this.repo.getAll();
  }

  @GetManyCriteria("/get-many", seriesEntitySchema)
  async getMany(
    @Body() body: GetManyBody,
    @User() user: UserPayload | null,
  ) {
    return await this.repo.getMany( {
      ...body,
      requestUserId: user?.id ?? null,
    } );
  }

  @GetOne("/:id", seriesEntitySchema)
  async getOne(@Param() params: IdParam) {
    return await this.repo.getOneById(params.id);
  }

  @Get("/:id/seasons")
  @UseInterceptors(ResponseFormatterInterceptor)
  @ValidateResponseWithZodSchema(createOneResultResponseSchema(episodesBySeasonSchema))
  @HttpCode(HttpStatus.OK)
  async getSeasons(
    @Param() params: IdParam,
    @User() user: UserPayload | null,
  ) {
    const ret = await this.repo.getSeasonsById(params.id, {
      requestingUserId: user?.id,
      criteria: {
        expand: ["fileInfos", ...(user ? ["userInfo" as any] : [])],
      },
    } );

    episodesBySeasonSchema.parse(ret);

    return ret;
  }

  @UserPost("/", seriesEntitySchema)
  async createOne(
    @Body() body: CreateBody,
    @User() _user: UserPayload,
  ) {
    return await this.repo.createOneAndGet( {
      ...body,
      imageCoverId: body.imageCoverId ?? null,
    } );
  }

  @UserPatchOne("/:id", seriesEntitySchema)
  async patchOne(
    @Param() params: IdParam,
    @Body() body: PatchBody,
  ) {
    return await this.repo.patchOneByIdAndGet(params.id, body);
  }

  @AdminDeleteOne("/:id", seriesEntitySchema)
  async deleteOne(@Param() params: IdParam) {
    return await this.repo.deleteOneByIdAndGet(params.id);
  }
}
