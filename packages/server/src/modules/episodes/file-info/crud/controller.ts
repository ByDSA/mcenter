import { Body, Controller, Param } from "@nestjs/common";
import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";
import { createZodDto } from "nestjs-zod";
import { EpisodeFileInfoEntity, episodeFileInfoEntitySchema } from "$shared/models/episodes/file-info";
import { PatchOne } from "#utils/nestjs/rest";
import { assertFoundClient } from "#utils/validation/found";
import { EpisodeFileInfoRepository } from "./repository";

class PatchOneByIdParamsDto
  extends createZodDto(EpisodeFileInfoCrudDtos.PatchOneById.paramsSchema) {}
class PatchOneByIdBodyDto extends createZodDto(EpisodeFileInfoCrudDtos.PatchOneById.bodySchema) {}

const schema = episodeFileInfoEntitySchema;

@Controller()
export class EpisodeFileInfosCrudController {
  constructor(
    private readonly fileInfoRepo: EpisodeFileInfoRepository,
  ) {
  }

  @PatchOne("/:id", schema)
  async patchOneByIdAndGet(
    @Param() params: PatchOneByIdParamsDto,
    @Body() body: PatchOneByIdBodyDto,
  ): Promise<EpisodeFileInfoEntity> {
    const got = await this.fileInfoRepo.patchOneByIdAndGet(params.id, body);

    assertFoundClient(got);

    return got;
  }
}
