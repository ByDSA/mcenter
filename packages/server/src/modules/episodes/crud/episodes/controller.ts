import { Body, Controller } from "@nestjs/common";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { createZodDto } from "nestjs-zod";
import { Param } from "@nestjs/common";
import { UserPayload } from "$shared/models/auth";
import { GetManyCriteria, UserCreateOne, UserPatchOne, AdminDeleteOne, GetOneById, GetOneCriteria } from "#utils/nestjs/rest";
import { episodeEntitySchema } from "#episodes/models";
import { User } from "#core/auth/users/User.decorator";
import { IdParamDto } from "#utils/validation/dtos";
import { EpisodesRepository } from "./repository";

class GetManyBodyDto extends createZodDto(
  EpisodesCrudDtos.GetMany.criteriaSchema,
) {}
class GetOneBodyDto extends createZodDto(
  EpisodesCrudDtos.GetOne.criteriaSchema,
) {}

class CreateBody extends createZodDto(EpisodesCrudDtos.CreateOne.bodySchema) {}
class PatchBody extends createZodDto(EpisodesCrudDtos.Patch.bodySchema) {}

const schema = episodeEntitySchema;

@Controller("/")
export class EpisodesCrudController {
  constructor(
    private readonly episodesRepo: EpisodesRepository,
  ) {
  }

  @GetOneById(schema)
  async getOneById(
    @Param() params: IdParamDto,
  ) {
    return await this.episodesRepo.getOneById(params.id);
  }

  @GetOneCriteria(schema)
  async getOneByCriteria(
    @Body() body: GetOneBodyDto,
    @User() user: UserPayload | null,
  ) {
    return await this.episodesRepo.getOne(body, {
      requestingUserId: user?.id,
    } );
  }

  @GetManyCriteria(schema)
  async getManyByCriteria(
    @Body() body: GetManyBodyDto,
    @User() user: UserPayload | null,
  ) {
    return await this.episodesRepo.getMany(body, {
      requestingUserId: user?.id,
    } );
  }

  @UserCreateOne(schema)
  async createOne(
    @Body() body: CreateBody,
    @User() user: UserPayload,
  ) {
    return await this.episodesRepo.createOneAndGet( {
      ...body,
      uploaderUserId: user.id,
    } );
  }

  @UserPatchOne(schema)
  async patchOne(
    @Param() params: IdParamDto,
    @Body() body: PatchBody,
  ) {
    return await this.episodesRepo.patchOneByIdAndGet(params.id, body);
  }

  @AdminDeleteOne(schema)
  async deleteOne(@Param() params: IdParamDto) {
    return await this.episodesRepo.deleteOneByIdAndGet(params.id);
  }
}
