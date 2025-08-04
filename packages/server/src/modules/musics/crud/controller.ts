import { Body, Controller, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { MusicEntity, musicEntitySchema } from "#musics/models";
import { GetOne, PatchOne } from "#utils/nestjs/rest";
import { MusicRepository } from "./repository";

class GetOneByIdParamsDto extends createZodDto(MusicCrudDtos.GetOne.ById.paramsSchema) {}
class PatchParamsDto extends createZodDto(MusicCrudDtos.PatchOneById.paramsSchema) {}
class PatchBodyDto extends createZodDto(MusicCrudDtos.PatchOneById.bodySchema) {}

@Controller("/")
export class MusicCrudController {
  constructor(
    private readonly musicRepo: MusicRepository,
  ) {
  }

  @PatchOne(":id", musicEntitySchema)
  async patchOneByIdAndGet(
    @Param() params: PatchParamsDto,
    @Body() body: PatchBodyDto,
  ) {
    const { id } = params;

    return await this.musicRepo.patchOneByIdAndGet(id, body);
  }

  @GetOne("/:id", musicEntitySchema)
  async getOneById(
    @Param() params: GetOneByIdParamsDto,
  ): Promise<MusicEntity | null> {
    const { id } = params;

    return await this.musicRepo.getOneById(id);
  }
}
