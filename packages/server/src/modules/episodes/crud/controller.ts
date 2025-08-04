import { Body, Controller, Param } from "@nestjs/common";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { createZodDto } from "nestjs-zod";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { GetMany, GetManyCriteria, GetOne } from "#utils/nestjs/rest/crud/get";
import { PatchOne } from "#utils/nestjs/rest";
import { assertFound } from "#utils/validation/found";
import { EpisodesRepository } from "./repository";

class GetOneByIdParamsDto extends createZodDto(EpisodesCrudDtos.GetOne.ById.paramsSchema) {}
class GetAllParamsDto extends createZodDto(EpisodesCrudDtos.GetAll.paramsSchema) {}
class GetManyByCriteriaBodyDto extends createZodDto(
  EpisodesCrudDtos.GetManyByCriteria.criteriaSchema,
) {}
class PatchOneByIdParamsDto extends createZodDto(EpisodesCrudDtos.PatchOneById.paramsSchema) {}
class PatchOneByIdBodyDto extends createZodDto(EpisodesCrudDtos.PatchOneById.bodySchema) {}

const schema = episodeEntitySchema;

@Controller()
export class EpisodesCrudController {
  constructor(
    private readonly episodeRepo: EpisodesRepository,
  ) {
  }

  @PatchOne("/:seriesKey/:episodeKey", schema)
  async patchOneByIdAndGet(
    @Param() params: PatchOneByIdParamsDto,
    @Body() body: PatchOneByIdBodyDto,
  ): Promise<EpisodeEntity> {
    const episodePartial = body;
    const compKey = params;
    const got = await this.episodeRepo.patchOneByCompKeyAndGet(compKey, episodePartial);

    assertFound(got);

    return got;
  }

  @GetMany("/:seriesKey", schema)
  async getAll(
    @Param() params: GetAllParamsDto,
  ) {
    const { seriesKey } = params;

    return await this.episodeRepo.getAllBySeriesKey(seriesKey);
  }

  @GetOne("/:seriesKey/:episodeKey", schema)
  async getOneById(
    @Param() params: GetOneByIdParamsDto,
  ) {
    const got = await this.episodeRepo.getOneByCompKey(params);

    assertFound(got);

    return got;
  }

  @GetManyCriteria("/search", schema)
  async getManyByCriteria(
    @Body() body: GetManyByCriteriaBodyDto,
  ) {
    return await this.episodeRepo.getManyByCriteria(body);
  }
}
