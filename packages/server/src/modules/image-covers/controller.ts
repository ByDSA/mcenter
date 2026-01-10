import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import { ImageCoverEntity, imageCoverEntitySchema } from "$shared/models/image-covers";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { UserPayload } from "$shared/models/auth";
import { AdminDeleteOne, AdminPatchOne, GetManyCriteria, GetOneCriteria } from "#utils/nestjs/rest";
import { Authenticated } from "#core/auth/users/Authenticated.guard";
import { User } from "#core/auth/users/User.decorator";
import { ImageCoversRepository } from "./repositories";
import { ImageCoversUploadService, UploadFile, UploadFileDto, UploadFileInterceptor } from "./upload.service";

class GetOneByIdParamsDto extends createZodDto(ImageCoverCrudDtos.GetOne.ById.paramsSchema) {}
class GetManyByCriteriaDto extends createZodDto(ImageCoverCrudDtos.GetMany.criteriaSchema) {}
class GetManyOneByCriteriaDto extends createZodDto(ImageCoverCrudDtos.GetOne.criteriaSchema) {}
class PatchParamsDto extends createZodDto(ImageCoverCrudDtos.PatchOneById.paramsSchema) {}
class DeleteOneParamsDto extends createZodDto(ImageCoverCrudDtos.DeleteOneById.paramsSchema) {}
class PatchBodyDto extends createZodDto(ImageCoverCrudDtos.PatchOneById.bodySchema) {}

@Controller("/")
export class ImageCoverCrudController {
  constructor(
    private readonly repo: ImageCoversRepository,
    private readonly uploadService: ImageCoversUploadService,
  ) {
  }

  @Post("image")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(UploadFileInterceptor)
  @Authenticated() // TODO: filtro role uploader
  async uploadFile(
      @UploadedFile() file: UploadFile,
      @Body() uploadDto: UploadFileDto,
      @User() user: UserPayload,
  ): Promise<ImageCoverCrudDtos.UploadFile.Response> {
    const uploaderUserId = user.id;

    return await this.uploadService.upload(file, uploadDto, uploaderUserId);
  }

  @GetManyCriteria("/search-many", imageCoverEntitySchema)
  async getManyByCriteria(
    @Body() criteria: GetManyByCriteriaDto,
  ): Promise<ImageCoverEntity[]> {
    return await this.repo.getMany( {
      criteria,
    } );
  }

  @AdminPatchOne("/:id", imageCoverEntitySchema)
  async patchOneByIdAndGet(
    @Param() params: PatchParamsDto,
    @Body() body: PatchBodyDto,
  ) {
    const { id } = params;

    return await this.repo.patchOneByIdAndGet(id, body);
  }

  @AdminDeleteOne("/:id", imageCoverEntitySchema)
  async deleteOneByIdAndGet(
    @Param() params: DeleteOneParamsDto,
  ) {
    const { id } = params;

    return await this.repo.deleteOneByIdAndGet(id);
  }

  @Get("/:id")
  async getOneById(
    @Param() params: GetOneByIdParamsDto,
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
