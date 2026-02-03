import { Controller, Body, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { AdminDeleteOne, GetManyCriteria } from "#utils/nestjs/rest";
import { IdParamDto } from "#utils/validation/dtos";
import { MusicFileInfoEntity, musicFileInfoEntitySchema } from "../models";
import { MusicFileInfoRepository } from "./repository";

class GetManyCriteriaDto extends createZodDto(MusicFileInfoCrudDtos.GetMany.criteriaSchema) { }

@Controller()
export class MusicFileInfoController {
  constructor(
    private readonly fileInfosRepo: MusicFileInfoRepository,
  ) {}

  @GetManyCriteria(musicFileInfoEntitySchema)
  async getMany(
    @Body() body: GetManyCriteriaDto,
  ): Promise<MusicFileInfoEntity[]> {
    if (body.filter?.musicId)
      return await this.fileInfosRepo.getAllByMusicId(body.filter.musicId);

    return [];
  }

  @AdminDeleteOne(musicFileInfoEntitySchema)
  async deleteOne(
    @Param() params: IdParamDto,
  ) {
    const { id } = params;

    return await this.fileInfosRepo.deleteOneById(id);
  }
}
