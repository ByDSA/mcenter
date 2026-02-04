import { Controller, Body, UploadedFile } from "@nestjs/common";
import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { User } from "#core/auth/users/User.decorator";
import { createMulterDto, UploadFile, UserUploadFile } from "#utils/files";
import { EpisodeFileInfoUploadService, UploadFileInterceptor } from "./service";

export class UploadEpisodeFileInfoDto extends createMulterDto(
  EpisodeFileInfoCrudDtos.UploadFile.requestBodySchema,
) {};

@Controller("/")
export class EpisodeFileInfosUploadController {
  constructor(
    private readonly uploadService: EpisodeFileInfoUploadService,
  ) {
  }

  @UserUploadFile("/", {
    fileInterceptor: UploadFileInterceptor,
    responseSchema: EpisodeFileInfoCrudDtos.UploadFile.responseSchema,
  } )
  async uploadFile(
    @UploadedFile() file: UploadFile,
    @Body() uploadDto: UploadEpisodeFileInfoDto,
    @User() user: UserPayload,
  ) {
    return await this.uploadService.upload( {
      file,
      uploadDto,
      uploaderUserId: user.id,
    } );
  }
}
