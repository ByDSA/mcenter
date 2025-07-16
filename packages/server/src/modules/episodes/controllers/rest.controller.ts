import { Body, Controller, Param } from "@nestjs/common";
import { neverCase } from "$shared/utils/validation";
import { getAll } from "$shared/models/episodes/dto/rest/get-all";
import { getOneById } from "$shared/models/episodes/dto/rest/get-one-by-id";
import { getManyByCriteria } from "$shared/models/episodes/dto/rest/get-many-by-criteria";
import { patchOneById } from "$shared/models/episodes/dto/rest/patch-one-by-id";
import { createZodDto } from "nestjs-zod";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { SerieRepository } from "#modules/series/repositories";
import { SerieEntity } from "#modules/series/models";
import { GetMany, GetManyCriteria, GetOne } from "#utils/nestjs/rest/Get";
import { PatchOne } from "#utils/nestjs/rest";
import { assertFound } from "#utils/validation/found";
import { EpisodesRepository } from "../repositories";

class GetOneByIdParamsDto extends createZodDto(getOneById.paramsSchema) {}
class GetAllParamsDto extends createZodDto(getAll.paramsSchema) {}
class GetManyByCriteriaBodyDto extends createZodDto(getManyByCriteria.reqBodySchema) {}
class PatchOneByIdParamsDto extends createZodDto(patchOneById.reqParamsSchema) {}
class PatchOneByIdBodyDto extends createZodDto(patchOneById.reqBodySchema) {}

enum ResourceType {
  SERIES = "series",
}

const schema = episodeEntitySchema;

@Controller()
export class EpisodesRestController {
  constructor(
    private readonly episodeRepository: EpisodesRepository,
    private readonly serieRepo: SerieRepository,
  ) {
  }

  @PatchOne("/:serieId/:code", schema)
  async patchOneByIdAndGet(
    @Param() params: PatchOneByIdParamsDto,
    @Body() body: PatchOneByIdBodyDto,
  ): Promise<EpisodeEntity> {
    const episodePartial = body;
    const id = params;
    const got = await this.episodeRepository.patchOneByIdAndGet(id, episodePartial);

    assertFound(got);

    return got;
  }

  @GetMany("/:serieId", schema)
  async getAll(
    @Param() params: GetAllParamsDto,
  ) {
    const { serieId } = params;

    return await this.episodeRepository.getAllBySerieId(serieId);
  }

  @GetOne("/:serieId/:code", schema)
  async getOneById(
    @Param() params: GetOneByIdParamsDto,
  ) {
    const got = await this.episodeRepository.getOneById(params);

    assertFound(got);

    return got;
  }

  @GetManyCriteria("/search", schema)
  async getManyBySearch(
    @Body() body: GetManyByCriteriaBodyDto,
  ) {
    const episodes = [];
    const filterPath = body.filter?.path;

    if (filterPath) {
      const splitted = filterPath.split("/");
      const type: ResourceType = splitted[0] as ResourceType;

      switch (type) {
        case ResourceType.SERIES: {
          const episode: EpisodeEntity | null = await this.episodeRepository
            .getOneByPath(filterPath);

          if (episode)
            episodes.push(episode);

          break;
        }
        default:
          neverCase(type);
      }
    }

    if (body.expand?.includes(ResourceType.SERIES)) {
      const series: {[serieId: string]: SerieEntity} = {};

      for (const ep of episodes) {
        const { serieId } = ep.id;
        // TODO: quitar await en for
        const serie = series[serieId] ?? await this.serieRepo.getOneById(serieId);

        ep.serie = serie;

        series[serieId] = serie;
      }
    }

    return episodes;
  }
}
