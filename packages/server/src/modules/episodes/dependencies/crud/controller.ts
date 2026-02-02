import type { CanGetAll } from "#utils/layers/controller";
import { Request, Response } from "express";
import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { EpisodeDependencyCrudDtos } from "$shared/models/episodes/dependencies/dto/transport";
import { episodeCompKeySchema } from "$shared/models/episodes/episode";
import { AdminDeleteOne, GetAll, GetManyCriteria, GetOneById } from "#utils/nestjs/rest";
import { IdParamDto } from "#utils/validation/dtos";
import { type EpisodeDependencyEntity, episodeDependencyEntitySchema } from "../models";
import { EpisodeDependenciesRepository } from "./repository/repository";

class GetManyBodyDto
  extends createZodDto(EpisodeDependencyCrudDtos.GetMany.criteriaSchema) {}

class LastCompKeyParamsDto extends createZodDto(episodeCompKeySchema) {}

@Controller()
export class EpisodeDependenciesCrudController
implements
    CanGetAll<Request, Response> {
  constructor(
    private readonly repo: EpisodeDependenciesRepository,
  ) {
  }

  @GetAll(episodeDependencyEntitySchema)
  async getAll() {
    return await this.repo.getAll();
  }

  @GetOneById(episodeDependencyEntitySchema, {
    url: "/:seriesKey/:episodeKey",
  } )
  async getNext(
    @Param() params: LastCompKeyParamsDto,
  ) {
    return await this.repo.getNextByLast( {
      episodeKey: params.episodeKey,
      seriesKey: params.seriesKey,
    } );
  }

  @GetManyCriteria(episodeDependencyEntitySchema)
  async getManyEntriesByCriteria(
    @Body() body: GetManyBodyDto,
  ) {
    return await this.repo.getManyByCriteria(body);
  }

  @AdminDeleteOne(episodeDependencyEntitySchema)
  async deleteOneByIdAndGet(
    @Param() params: IdParamDto,
  ): Promise<EpisodeDependencyEntity> {
    const { id } = params;
    const deleted = await this.repo.deleteOneByIdAndGet(id);

    return deleted;
  }
}
