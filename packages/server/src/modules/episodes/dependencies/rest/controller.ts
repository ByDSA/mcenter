import type { CanGetAll } from "#utils/layers/controller";
import { Request, Response } from "express";
import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { EpisodeDependencyRestDtos } from "$shared/models/episodes/dependencies/dto/transport";
import { episodeCompKeySchema } from "$sharedSrc/models/episodes/episode";
import { DeleteOne, GetMany, GetManyCriteria, GetOne } from "#utils/nestjs/rest";
import { type EpisodeDependencyEntity, episodeDependencyEntitySchema } from "../models";
import { EpisodeDependenciesRepository } from "./repository/repository";

class GetManyByCriteriaBodyDto
  extends createZodDto(EpisodeDependencyRestDtos.GetManyByCriteria.criteriaSchema) {}
class DeleteOneByIdParamsDto
  extends createZodDto(EpisodeDependencyRestDtos.DeleteOneById.paramsSchema) {}

class LastCompKeyParamsDto extends createZodDto(episodeCompKeySchema) {}

@Controller()
export class EpisodeDependenciesRestController
implements
    CanGetAll<Request, Response> {
  constructor(
    private readonly repo: EpisodeDependenciesRepository,
  ) {
  }

  @GetMany("/", episodeDependencyEntitySchema)
  async getAll() {
    return await this.repo.getAll();
  }

  @GetOne("/:seriesKey/:episodeKey", episodeDependencyEntitySchema)
  async getNext(
    @Param() params: LastCompKeyParamsDto,
  ) {
    return await this.repo.getNextByLast( {
      episodeKey: params.episodeKey,
      seriesKey: params.seriesKey,
    } );
  }

  @GetManyCriteria("/", episodeDependencyEntitySchema)
  async getManyEntriesByCriteria(
    @Body() body: GetManyByCriteriaBodyDto,
  ) {
    return await this.repo.getManyByCriteria(body);
  }

  @DeleteOne("/:id", episodeDependencyEntitySchema)
  async deleteOneByIdAndGet(
    @Param() params: DeleteOneByIdParamsDto,
  ): Promise<EpisodeDependencyEntity> {
    const { id } = params;
    const deleted = await this.repo.deleteOneByIdAndGet(id);

    return deleted;
  }
}
