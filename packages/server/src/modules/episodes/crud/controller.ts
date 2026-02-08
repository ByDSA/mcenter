import { Body, Controller } from "@nestjs/common";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { EpisodeInfoCrudDtos } from "$shared/models/episodes/user-info/dto/transport";
import { createZodDto } from "nestjs-zod";
import { Param } from "@nestjs/common";
import { UserPayload } from "$shared/models/auth";
import { episodeUserInfoEntitySchema } from "$shared/models/episodes";
import { GetManyCriteria, UserCreateOne, UserPatchOne, AdminDeleteOne, GetOneById } from "#utils/nestjs/rest";
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

  @GetOneById(schema)
  async getOneById(
    @Param() params: IdParamDto,
  ) {
    return await this.episodesRepo.getOneById(params.id);
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

  @UserPatchOne(episodeUserInfoEntitySchema, {
    url: "/:id/user-info",
  } )
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
