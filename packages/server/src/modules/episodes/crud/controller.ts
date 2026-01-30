import { Body, Controller, Get } from "@nestjs/common";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { EpisodeInfoCrudDtos } from "$shared/models/episodes/user-info/dto/transport";
import { createZodDto } from "nestjs-zod";
import { Param } from "@nestjs/common";
import { UserPayload } from "$shared/models/auth";
import { episodeUserInfoEntitySchema } from "$shared/models/episodes";
import { mongoDbId } from "$shared/models/resources/partial-schemas";
import z from "zod";
import { EpisodesRepository } from "../crud/repositories/episodes";
import { EpisodesUsersRepository } from "./repositories/user-infos";
import { GetManyCriteria, UserPost, UserPatchOne, AdminDeleteOne } from "#utils/nestjs/rest";
import { episodeEntitySchema } from "#episodes/models";
import { User } from "#core/auth/users/User.decorator";

class GetManyByCriteriaBodyDto extends createZodDto(
  EpisodesCrudDtos.GetManyByCriteria.criteriaSchema,
) {}

class PatchOneByIdUserInfoBodyDto extends createZodDto(
  EpisodeInfoCrudDtos.PatchOneById.bodySchema,
) {}
class PatchOneByIdUserInfoParamsDto extends createZodDto(
  EpisodeInfoCrudDtos.PatchOneById.paramsSchema,
) {}

class CreateBody extends createZodDto(EpisodesCrudDtos.CreateOne.bodySchema) {}
class PatchBody extends createZodDto(EpisodesCrudDtos.PatchOneById.bodySchema) {}
class IdParam extends createZodDto(z.object( {
  id: mongoDbId,
} )) {}

const schema = episodeEntitySchema;

@Controller("/")
export class EpisodesCrudController {
  constructor(
    private readonly episodesRepo: EpisodesRepository,
    private readonly episodesUserInfoRepo: EpisodesUsersRepository,
  ) {
  }

  @Get("/:id")
  async getOneById(@Param() params: IdParam) {
    return await this.episodesRepo.getOneById(params.id);
  }

  @GetManyCriteria("/search", schema)
  async getManyByCriteria(
    @Body() body: GetManyByCriteriaBodyDto,
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
    @Param() params: IdParam,
    @Body() body: PatchBody,
  ) {
    return await this.episodesRepo.patchOneByIdAndGet(params.id, body);
  }

  @AdminDeleteOne("/:id", schema)
  async deleteOne(@Param() params: IdParam) {
    return await this.episodesRepo.deleteOneByIdAndGet(params.id);
  }

  @UserPatchOne("/:id/user-info", episodeUserInfoEntitySchema)
  async patchOneUserInfoByKeyAndGet(
    @Param() params: PatchOneByIdUserInfoParamsDto,
    @Body() body: PatchOneByIdUserInfoBodyDto,
    @User() user: UserPayload,
  ) {
    return await this.episodesUserInfoRepo.patchOneByIdAndGet( {
      episodeId: params.id,
      userId: user.id,
    }, body);
  }
}
