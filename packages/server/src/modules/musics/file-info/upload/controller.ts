import { Controller, Body, UploadedFile } from "@nestjs/common";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { User } from "#core/auth/users/User.decorator";
import { createMulterDto, UploadFile, UserUploadFile } from "#utils/files";
import { MusicFileInfoUploadRepository, UploadFileInterceptor } from "./service";

export class UploadMusicFileInfoDto extends createMulterDto(
  MusicFileInfoCrudDtos.UploadFile.requestBodySchema,
) {};

@Controller()
export class MusicFileInfoUploadController {
  constructor(
    private readonly uploadRepo: MusicFileInfoUploadRepository,
  ) {}

  @UserUploadFile("/", {
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
}
