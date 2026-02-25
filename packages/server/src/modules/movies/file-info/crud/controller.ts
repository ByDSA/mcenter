import { Controller, Body, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MovieFileInfoCrudDtos } from "$shared/models/movies/file-info/dto/transport";
import { AdminDeleteOne, AdminPatchOne, GetManyCriteria } from "#utils/nestjs/rest";
import { IdParamDto } from "#utils/validation/dtos";
import { MovieFileInfoEntity, movieFileInfoEntitySchema } from "../models";
import { MovieFileInfoRepository } from "./repository";

class GetManyCriteriaDto extends createZodDto(MovieFileInfoCrudDtos.GetMany.criteriaSchema) {}
class PatchOneBodyDto extends createZodDto(MovieFileInfoCrudDtos.PatchOne.bodySchema) {}

@Controller()
export class MovieFileInfoController {
  constructor(
    private readonly fileInfoRepo: MovieFileInfoRepository,
  ) {}

  @GetManyCriteria(movieFileInfoEntitySchema)
  async getMany(
    @Body() body: GetManyCriteriaDto,
  ): Promise<MovieFileInfoEntity[]> {
    if (body.filter?.movieId)
      return await this.fileInfoRepo.getAllByMovieId(body.filter.movieId);

    return [];
  }

  @AdminPatchOne(movieFileInfoEntitySchema)
  async patchOneByIdAndGet(
    @Param() params: IdParamDto,
    @Body() body: PatchOneBodyDto,
  ): Promise<MovieFileInfoEntity> {
    return await this.fileInfoRepo.patchOneByIdAndGet(params.id, body);
  }

  @AdminDeleteOne(movieFileInfoEntitySchema)
  async deleteOne(
    @Param() params: IdParamDto,
  ): Promise<MovieFileInfoEntity> {
    return await this.fileInfoRepo.deleteOneById(params.id);
  }
}
