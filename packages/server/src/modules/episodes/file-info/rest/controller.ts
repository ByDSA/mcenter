import { Body, Controller, Param } from "@nestjs/common";
import { EpisodeFileInfoRestDtos } from "$shared/models/episodes/file-info/dto/transport";
import { createZodDto } from "nestjs-zod";
import { EpisodeFileInfoEntity, episodeFileInfoEntitySchema } from "$shared/models/episodes/file-info";
import { PatchOne } from "#utils/nestjs/rest";
import { assertFound } from "#utils/validation/found";
import { EpisodeFileInfoRepository } from "./repository";

class PatchOneByIdParamsDto
  extends createZodDto(EpisodeFileInfoRestDtos.PatchOneById.paramsSchema) {}
class PatchOneByIdBodyDto extends createZodDto(EpisodeFileInfoRestDtos.PatchOneById.bodySchema) {}

const schema = episodeFileInfoEntitySchema;

@Controller()
export class EpisodeFileInfosRestController {
  constructor(
    private readonly fileInfoRepository: EpisodeFileInfoRepository,
  ) {
  }

  @PatchOne("/:id", schema)
  async patchOneByIdAndGet(
    @Param() params: PatchOneByIdParamsDto,
    @Body() body: PatchOneByIdBodyDto,
  ): Promise<EpisodeFileInfoEntity> {
    const got = await this.fileInfoRepository.patchOneByIdAndGet(params.id, body);

    assertFound(got);

    return got;
  }
}
