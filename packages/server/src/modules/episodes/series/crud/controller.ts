import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { UserPayload } from "$shared/models/auth";
import { SeriesCrudDtos } from "$shared/models/episodes/series/dto/transport";
import { UserCreateOne, UserPatchOne, AdminDeleteOne, GetAll, GetManyCriteria, GetOneById } from "#utils/nestjs/rest";
import { User } from "#core/auth/users/User.decorator";
import { episodesBySeasonSchema } from "#episodes/models";
import { IdParamDto } from "#utils/validation/dtos";
import { seriesEntitySchema } from "../models";
import { SeriesRepository } from "./repository";

class CreateBody extends createZodDto(SeriesCrudDtos.CreateOne.bodySchema) {}
class PatchBody extends createZodDto(SeriesCrudDtos.Patch.bodySchema) {}
class GetManyBody extends createZodDto(SeriesCrudDtos.GetMany.criteriaSchema) {}

// TODO: patch/create sólo uploaders
@Controller("/")
export class SeriesCrudController {
  constructor(
    private readonly repo: SeriesRepository,
  ) {}

  @GetAll(seriesEntitySchema)
  async getAll() {
    return await this.repo.getAll();
  }

  @GetManyCriteria(seriesEntitySchema)
  async getMany(
    @Body() body: GetManyBody,
    @User() user: UserPayload | null,
  ) {
    return await this.repo.getMany( {
      ...body,
      requestUserId: user?.id ?? null,
    } );
  }

  @GetOneById(seriesEntitySchema)
  async getOne(@Param() params: IdParamDto) {
    return await this.repo.getOneById(params.id);
  }

  @GetOneById(episodesBySeasonSchema, {
    url: "/:id/seasons",
  } )
  async getSeasons(
    @Param() params: IdParamDto,
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

  @UserCreateOne(seriesEntitySchema)
  async createOne(
    @Body() body: CreateBody,
    @User() _user: UserPayload,
  ) {
    return await this.repo.createOneAndGet( {
      ...body,
      imageCoverId: body.imageCoverId ?? null,
    } );
  }

  @UserPatchOne(seriesEntitySchema)
  async patchOne(
    @Param() params: IdParamDto,
    @Body() body: PatchBody,
  ) {
    return await this.repo.patchOneByIdAndGet(params.id, body);
  }

  @AdminDeleteOne(seriesEntitySchema)
  async deleteOne(
    @Param() params: IdParamDto,
  ) {
    return await this.repo.deleteOneByIdAndGet(params.id);
  }
}
