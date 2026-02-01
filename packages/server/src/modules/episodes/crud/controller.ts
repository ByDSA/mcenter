import { Body, Controller, Get } from "@nestjs/common";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { EpisodeInfoCrudDtos } from "$shared/models/episodes/user-info/dto/transport";
import { createZodDto } from "nestjs-zod";
import { Param } from "@nestjs/common";
import { UserPayload } from "$shared/models/auth";
import { episodeUserInfoEntitySchema } from "$shared/models/episodes";
import { GetManyCriteria, UserPost, UserPatchOne, AdminDeleteOne } from "#utils/nestjs/rest";
import { episodeEntitySchema } from "#episodes/models";
import { User } from "#core/auth/users/User.decorator";
import { IdParamDto } from "#utils/validation/dtos";
import { EpisodesRepository } from "../crud/repositories/episodes";
import { EpisodesUsersRepository } from "./repositories/user-infos";

class GetManyBodyDto extends createZodDto(
  EpisodesCrudDtos.GetMany.criteriaSchema,
) {}

class PatchOneByIdUserInfoBodyDto extends createZodDto(
  EpisodeInfoCrudDtos.Patch.bodySchema,
) {}

class CreateBody extends createZodDto(EpisodesCrudDtos.CreateOne.bodySchema) {}
class PatchBody extends createZodDto(EpisodesCrudDtos.Patch.bodySchema) {}

const schema = episodeEntitySchema;

@Controller("/")
export class EpisodesCrudController {
  constructor(
    private readonly episodesRepo: EpisodesRepository,
    private readonly episodesUserInfoRepo: EpisodesUsersRepository,
  ) {
  }

  @Get("/:id")
  async getOneById(@Param() params: IdParamDto) {
    return await this.episodesRepo.getOneById(params.id);
  }

  @GetManyCriteria("/search", schema)
  async getManyByCriteria(
    @Body() body: GetManyBodyDto,
    @User() user: UserPayload | null,
  ) {
    return await this.episodesRepo.getMany( {
      requestingUserId: user?.id,
      criteria: body,
    } );
  }

  @UserPost("/", schema)
  async createOne(
    @Body() body: CreateBody,
    @User() user: UserPayload,
  ) {
    return await this.episodesRepo.createOneAndGet( {
      ...body,
      uploaderUserId: user.id,
    } );
  }

  @UserPatchOne("/:id", schema)
  async patchOne(
    @Param() params: IdParamDto,
    @Body() body: PatchBody,
  ) {
    return await this.episodesRepo.patchOneByIdAndGet(params.id, body);
  }

  @AdminDeleteOne("/:id", schema)
  async deleteOne(@Param() params: IdParamDto) {
    return await this.episodesRepo.deleteOneByIdAndGet(params.id);
  }

  @UserPatchOne("/:id/user-info", episodeUserInfoEntitySchema)
  async patchOneUserInfoByKeyAndGet(
    @Param() params: IdParamDto,
    @Body() body: PatchOneByIdUserInfoBodyDto,
    @User() user: UserPayload,
  ) {
    return await this.episodesUserInfoRepo.patchOneByIdAndGet( {
      episodeId: params.id,
      userId: user.id,
    }, body);
  }
}
