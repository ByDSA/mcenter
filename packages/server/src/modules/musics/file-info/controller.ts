import { Controller, Post, UseInterceptors, HttpStatus, HttpCode, Body, UploadedFile, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { AdminDeleteOne, GetManyCriteria } from "#utils/nestjs/rest";
import { MusicFileInfoRepository } from "./crud/repository";
import { MusicFileInfoEntity, musicFileInfoEntitySchema } from "./models";
import { MusicFileInfoUploadRepository, UploadFile, UploadFileInterceptor, UploadMusicFileInfoDto } from "./upload.repository";

class GetManyCriteriaDto extends createZodDto(MusicFileInfoCrudDtos.GetMany.criteriaSchema) { }
class DeleteParamsDto extends createZodDto(MusicFileInfoCrudDtos.DeleteOneById.paramsSchema) { }

@Controller()
export class MusicFileInfoController {
  constructor(
    private readonly fileInfosRepo: MusicFileInfoRepository,
    private readonly uploadRepo: MusicFileInfoUploadRepository,
  ) {}

  @Post("upload")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(UploadFileInterceptor)
  async uploadFile(
    @UploadedFile() file: UploadFile,
    @Body() uploadDto: UploadMusicFileInfoDto,
  ): Promise<MusicFileInfoCrudDtos.UploadFile.Response> {
    return await this.uploadRepo.upload(file, uploadDto);
  }

  @GetManyCriteria("/", musicFileInfoEntitySchema)
  async getMany(
    @Body() body: GetManyCriteriaDto,
  ): Promise<MusicFileInfoEntity[]> {
    if (body.filter?.musicId)
      return await this.fileInfosRepo.getAllByMusicId(body.filter.musicId);

    return [];
  }

  @AdminDeleteOne("/:id")
  async deleteOne(
    @Param() params: DeleteParamsDto,
  ) {
    const { id } = params;

    return await this.fileInfosRepo.deleteOneById(id);
  }
}
