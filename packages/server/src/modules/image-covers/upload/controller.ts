import { Body, Controller, UploadedFile } from "@nestjs/common";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { User } from "#core/auth/users/User.decorator";
import { createMulterDto, UploadFile, UserUploadFile } from "#utils/files";
import { ImageCoversUploadService, UploadFileInterceptor } from "./service";

export class UploadFileDto extends createMulterDto(
  ImageCoverCrudDtos.UploadFile.requestBodySchema,
) {};

@Controller("/")
export class ImageCoverUploadController {
  constructor(
    private readonly uploadService: ImageCoversUploadService,
  ) { }

  @UserUploadFile("/", {
    fileInterceptor: UploadFileInterceptor,
    responseSchema: ImageCoverCrudDtos.UploadFile.responseSchema,
  } )
  async uploadFile(
    @UploadedFile() file: UploadFile,
    @Body() uploadDto: UploadFileDto,
    @User() user: UserPayload,
  ) {
    return await this.uploadService.upload( {
      file,
      uploadDto,
      uploaderUserId: user.id,
    } );
  }
}
