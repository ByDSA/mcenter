import { Body, Controller } from "@nestjs/common";
import { EpisodeInfoCrudDtos } from "$shared/models/episodes/user-info/dto/transport";
import { createZodDto } from "nestjs-zod";
import { Param } from "@nestjs/common";
import { UserPayload } from "$shared/models/auth";
import { episodeUserInfoEntitySchema } from "$shared/models/episodes";
import { UserPatchOne } from "#utils/nestjs/rest";
import { User } from "#core/auth/users/User.decorator";
import { IdParamDto } from "#utils/validation/dtos";
import { EpisodesUsersRepository } from "./repository";

class PatchOneByIdUserInfoBodyDto extends createZodDto(
  EpisodeInfoCrudDtos.Patch.bodySchema,
) {}

@Controller("/")
export class EpisodesUserInfoCrudController {
  constructor(
    private readonly episodesUserInfoRepo: EpisodesUsersRepository,
  ) {
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
