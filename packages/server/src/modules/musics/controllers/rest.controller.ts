import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicRestDtos } from "$shared/models/musics/dto/transport";
import { MusicEntity, musicEntitySchema } from "#musics/models";
import { GetOne, PatchOne } from "#utils/nestjs/rest";
import { MusicRepository } from "../repositories";

class GetOneByIdParamsDto extends createZodDto(MusicRestDtos.GetOne.ById.paramsSchema) {}
class PatchParamsDto extends createZodDto(MusicRestDtos.PatchOneById.paramsSchema) {}
class PatchBodyDto extends createZodDto(MusicRestDtos.PatchOneById.bodySchema) {}

@Controller("/")
export class MusicRestController {
  constructor(
    private readonly musicRepo: MusicRepository,
  ) {
  }

  @PatchOne(":id")
  async patchOneById(
    @Param() params: PatchParamsDto,
    @Body() body: PatchBodyDto,
  ) {
    const { id } = params;

    await this.musicRepo.patchOneById(id, body);
  }

  @GetOne("/:id", musicEntitySchema)
  async getOneById(
    @Param() params: GetOneByIdParamsDto,
  ): Promise<MusicEntity | null> {
    const { id } = params;

    return await this.musicRepo.getOneById(id);
  }
}
