import { Body, Controller } from "@nestjs/common";
import { EpisodesCrudDtos } from "$shared/models/episodes/dto/transport";
import { EpisodeInfoCrudDtos } from "$shared/models/episodes/user-info/dto/transport";
import { createZodDto } from "nestjs-zod";
import { Param } from "@nestjs/common";
import { UserPayload } from "$shared/models/auth";
import { episodeUserInfoEntitySchema } from "$shared/models/episodes";
import { GetManyCriteria } from "#utils/nestjs/rest/crud/get";
import { episodeEntitySchema } from "#episodes/models";
import { UserPatchOne } from "#utils/nestjs/rest";
import { User } from "#core/auth/users/User.decorator";
import { EpisodesRepository } from "../crud/repositories/episodes";
import { EpisodesUsersRepository } from "./repositories/user-infos";

class GetManyByCriteriaBodyDto extends createZodDto(
  EpisodesCrudDtos.GetManyByCriteria.criteriaSchema,
) {}

class PatchOneByIdUserInfoBodyDto extends createZodDto(
  EpisodeInfoCrudDtos.PatchOneById.bodySchema,
) {}
class PatchOneByIdUserInfoParamsDto extends createZodDto(
  EpisodeInfoCrudDtos.PatchOneById.paramsSchema,
) {}

const schema = episodeEntitySchema;

@Controller()
export class EpisodesCrudController {
  constructor(
    private readonly episodesRepo: EpisodesRepository,
    private readonly episodesUserInfoRepo: EpisodesUsersRepository,
  ) {
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
