import { Body, Controller, Param } from "@nestjs/common";
import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";
import { createZodDto } from "nestjs-zod";
import { EpisodeFileInfoEntity, episodeFileInfoEntitySchema } from "$shared/models/episodes/file-info";
import { AdminPatchOne } from "#utils/nestjs/rest";
import { assertFoundClient } from "#utils/validation/found";
import { IdParamDto } from "#utils/validation/dtos";
import { EpisodeFileInfoRepository } from "./repository";

class PatchOneByIdBodyDto extends createZodDto(EpisodeFileInfoCrudDtos.Patch.bodySchema) {}

const schema = episodeFileInfoEntitySchema;

@Controller()
export class EpisodeFileInfosCrudController {
  constructor(
    private readonly fileInfoRepo: EpisodeFileInfoRepository,
  ) {
  }

  @AdminPatchOne("/:id", schema)
  async patchOneByIdAndGet(
    @Param() params: IdParamDto,
    @Body() body: PatchOneByIdBodyDto,
  ): Promise<EpisodeFileInfoEntity> {
    const got = await this.fileInfoRepo.patchOneByIdAndGet(params.id, body);

    assertFoundClient(got);

    return got;
  }
}
