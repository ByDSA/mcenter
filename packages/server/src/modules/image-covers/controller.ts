import { Body, Controller, Param, UploadedFile } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { ImageCoverEntity, imageCoverEntitySchema } from "$shared/models/image-covers";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { AdminDeleteOne, AdminPatchOne, GetManyCriteria, GetOneById, GetOneCriteria } from "#utils/nestjs/rest";
import { User } from "#core/auth/users/User.decorator";
import { IdParamDto } from "#utils/validation/dtos";
import { createMulterDto, UploadFile, UserUploadFile } from "#utils/files";
import { ImageCoversRepository } from "./repositories";
import { ImageCoversUploadService, UploadFileInterceptor } from "./upload.service";

class GetManyBodyDto extends createZodDto(ImageCoverCrudDtos.GetMany.criteriaSchema) {}
class GetManyOneByCriteriaDto extends createZodDto(ImageCoverCrudDtos.GetOne.criteriaSchema) {}
class PatchBodyDto extends createZodDto(ImageCoverCrudDtos.Patch.bodySchema) {}
export class UploadFileDto extends createMulterDto(
  ImageCoverCrudDtos.UploadFile.requestBodySchema,
) {};

@Controller("/")
export class ImageCoverCrudController {
  constructor(
    private readonly repo: ImageCoversRepository,
    private readonly uploadService: ImageCoversUploadService,
  ) { }

  @UserUploadFile("image", {
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

  @GetManyCriteria(imageCoverEntitySchema)
  async getManyByCriteria(
    @Body() criteria: GetManyBodyDto,
  ): Promise<ImageCoverEntity[]> {
    return await this.repo.getMany( {
      criteria,
    } );
  }

  @AdminPatchOne(imageCoverEntitySchema)
  async patchOneByIdAndGet(
    @Param() params: IdParamDto,
    @Body() body: PatchBodyDto,
  ) {
    const { id } = params;

    return await this.repo.patchOneByIdAndGet(id, body);
  }

  @AdminDeleteOne(imageCoverEntitySchema)
  async deleteOneByIdAndGet(
    @Param() params: IdParamDto,
  ) {
    const { id } = params;

    return await this.repo.deleteOneByIdAndGet(id);
  }

  @GetOneById(imageCoverEntitySchema)
  async getOneById(
    @Param() params: IdParamDto,
  ) {
    const { id } = params;

    return await this.repo.getOneById(id);
  }

  @GetOneCriteria(ImageCoverCrudDtos.GetOne.responseDataSchema)
  async getOneCriteria(
    @Body() criteria: GetManyOneByCriteriaDto,
  ): Promise<ImageCoverEntity | null> {
    return await this.repo.getOne( {
      criteria,
    } );
  }
}
