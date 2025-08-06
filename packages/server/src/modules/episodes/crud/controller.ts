import { Body, Controller } from "@nestjs/common";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { createZodDto } from "nestjs-zod";
import { episodeEntitySchema } from "#episodes/models";
import { GetManyCriteria } from "#utils/nestjs/rest/crud/get";
import { EpisodesRepository } from "./repository";

class GetManyByCriteriaBodyDto extends createZodDto(
  EpisodesCrudDtos.GetManyByCriteria.criteriaSchema,
) {}

const schema = episodeEntitySchema;

@Controller()
export class EpisodesCrudController {
  constructor(
    private readonly episodesRepo: EpisodesRepository,
  ) {
  }

  @GetManyCriteria("/search", schema)
  async getManyByCriteria(
    @Body() body: GetManyByCriteriaBodyDto,
  ) {
    return await this.episodesRepo.getManyByCriteria(body);
  }
}
