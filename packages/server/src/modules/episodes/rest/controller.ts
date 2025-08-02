import { Body, Controller, Param } from "@nestjs/common";
import { EpisodesRestDtos } from "$shared/models/episodes/dto/transport";
import { createZodDto } from "nestjs-zod";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { GetMany, GetManyCriteria, GetOne } from "#utils/nestjs/rest/Get";
import { PatchOne } from "#utils/nestjs/rest";
import { assertFound } from "#utils/validation/found";
import { EpisodesRepository } from "./repository";

class GetOneByIdParamsDto extends createZodDto(EpisodesRestDtos.GetOne.ById.paramsSchema) {}
class GetAllParamsDto extends createZodDto(EpisodesRestDtos.GetAll.paramsSchema) {}
class GetManyByCriteriaBodyDto extends createZodDto(
  EpisodesRestDtos.GetManyByCriteria.criteriaSchema,
) {}
class PatchOneByIdParamsDto extends createZodDto(EpisodesRestDtos.PatchOneById.paramsSchema) {}
class PatchOneByIdBodyDto extends createZodDto(EpisodesRestDtos.PatchOneById.bodySchema) {}

const schema = episodeEntitySchema;

@Controller()
export class EpisodesRestController {
  constructor(
    private readonly episodeRepository: EpisodesRepository,
  ) {
  }

  @PatchOne("/:seriesKey/:episodeKey", schema)
  async patchOneByIdAndGet(
    @Param() params: PatchOneByIdParamsDto,
    @Body() body: PatchOneByIdBodyDto,
  ): Promise<EpisodeEntity> {
    const episodePartial = body;
    const compKey = params;
    const got = await this.episodeRepository.patchOneByCompKeyAndGet(compKey, episodePartial);

    assertFound(got);

    return got;
  }

  @GetMany("/:seriesKey", schema)
  async getAll(
    @Param() params: GetAllParamsDto,
  ) {
    const { seriesKey } = params;

    return await this.episodeRepository.getAllBySeriesKey(seriesKey);
  }

  @GetOne("/:seriesKey/:episodeKey", schema)
  async getOneById(
    @Param() params: GetOneByIdParamsDto,
  ) {
    const got = await this.episodeRepository.getOneByCompKey(params);

    assertFound(got);

    return got;
  }

  @GetManyCriteria("/search", schema)
  async getManyByCriteria(
    @Body() body: GetManyByCriteriaBodyDto,
  ) {
    return await this.episodeRepository.getManyByCriteria(body);
  }
}
