import { Body, Controller, Header, Options, Param } from "@nestjs/common";
import { container } from "tsyringe";
import { createZodDto } from "nestjs-zod";
import { assertFound } from "#shared/utils/http";
import { Music, MusicVoSchema } from "#musics/models";
import { getOneById, patchOneById } from "#musics/models/dto";
import { GetOne, PatchOne } from "#utils/nestjs/rest";
import { PatchOneParams } from "../repositories/types";
import { MusicRepository } from "../repositories";

class GetOneByIdParamsDto extends createZodDto(getOneById.paramsSchema) {}
class PatchParamsDto extends createZodDto(patchOneById.reqParamsSchema) {}
class PatchBodyDto extends createZodDto(patchOneById.reqBodySchema) {}

@Controller("/")
export class MusicRestController {
  constructor(
    private readonly musicRepo: MusicRepository = container.resolve(MusicRepository),
  ) {
  }

  @PatchOne(":id")
  async patchOneById(
    @Param() params: PatchParamsDto,
    @Body() body: PatchBodyDto,
  ) {
    const { id } = params;
    const { entity, unset } = body;
    const patchParams: PatchOneParams = {
      entity,
      unset,
    };

    await this.musicRepo.patchOneById(id, patchParams);
  }

  @GetOne("/:id", MusicVoSchema)
  async getOneById(
    @Param() params: GetOneByIdParamsDto,
  ): Promise<Music | null> {
    const { id } = params;
    const music = await this.musicRepo.getOneById(id);

    assertFound(music);

    return music;
  }

  @Options(":id")
  @Header("Access-Control-Allow-Origin", "*")
  @Header("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS")
  @Header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With")
  handleOptions(@Param("id") _id: string) {
    return;
  }
}
