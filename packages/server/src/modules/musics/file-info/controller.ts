import { Controller, Body, UploadedFile, Param } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { AdminDeleteOne, GetManyCriteria } from "#utils/nestjs/rest";
import { User } from "#core/auth/users/User.decorator";
import { IdParamDto } from "#utils/validation/dtos";
import { createMulterDto, UploadFile, UserUploadFile } from "#utils/files";
import { MusicFileInfoRepository } from "./crud/repository";
import { MusicFileInfoEntity, musicFileInfoEntitySchema } from "./models";
import { MusicFileInfoUploadRepository, UploadFileInterceptor } from "./upload.service";

class GetManyCriteriaDto extends createZodDto(MusicFileInfoCrudDtos.GetMany.criteriaSchema) { }
export class UploadMusicFileInfoDto extends createMulterDto(
  MusicFileInfoCrudDtos.UploadFile.requestBodySchema,
) {};

@Controller()
export class MusicFileInfoController {
  constructor(
    private readonly fileInfosRepo: MusicFileInfoRepository,
    private readonly uploadRepo: MusicFileInfoUploadRepository,
  ) {}

  @UserUploadFile("upload", {
    fileInterceptor: UploadFileInterceptor,
    responseSchema: MusicFileInfoCrudDtos.UploadFile.responseSchema,
  } )
  async uploadFile(
    @UploadedFile() file: UploadFile,
    @Body() uploadDto: UploadMusicFileInfoDto,
    @User() user: UserPayload,
  ) {
    return await this.uploadRepo.upload( {
      file,
      uploadDto,
      uploaderUserId: user.id,
    } );
  }

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
