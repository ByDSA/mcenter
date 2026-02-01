import { Controller, Post, UseInterceptors, HttpStatus, HttpCode, Body, UploadedFile, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { AdminDeleteOne, GetManyCriteria } from "#utils/nestjs/rest";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { User } from "#core/auth/users/User.decorator";
import { IdParamDto } from "#utils/validation/dtos";
import { MusicFileInfoRepository } from "./crud/repository";
import { MusicFileInfoEntity, musicFileInfoEntitySchema } from "./models";
import { MusicFileInfoUploadRepository, UploadFile, UploadFileInterceptor, UploadMusicFileInfoDto } from "./upload.service";

class GetManyCriteriaDto extends createZodDto(MusicFileInfoCrudDtos.GetMany.criteriaSchema) { }

@Controller()
export class MusicFileInfoController {
  constructor(
    private readonly fileInfosRepo: MusicFileInfoRepository,
    private readonly uploadRepo: MusicFileInfoUploadRepository,
  ) {}

  @Post("upload")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(UploadFileInterceptor)
  @Authenticated() // TODO: filtro role uploader
  async uploadFile(
    @UploadedFile() file: UploadFile,
    @Body() uploadDto: UploadMusicFileInfoDto,
    @User() user: UserPayload,
  ): Promise<MusicFileInfoCrudDtos.UploadFile.Response> {
    const uploaderUserId = user.id;

    return await this.uploadRepo.upload(file, uploadDto, uploaderUserId);
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
    @Param() params: IdParamDto,
  ) {
    const { id } = params;

    return await this.fileInfosRepo.deleteOneById(id);
  }
}
