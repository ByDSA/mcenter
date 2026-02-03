import type { UploadFileDto } from "./controller";
import path from "node:path";
import * as fs from "fs";
import { NestInterceptor, Type } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { diskStorage } from "multer";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImageCoverEntity } from "$shared/models/image-covers";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { createUploadFileSuccessResponse, diskStorageEnsureDestination, diskStorageUniqueFilename, fileMimeTypeFilter, getImageMime, UploadFileProps } from "#utils/files";
import { assertFoundClient } from "#utils/validation/found";
import { IMAGE_COVERS_FOLDER_PATH } from "../utils";
import { ImageCoversRepository } from "../crud/repositories";
import { ImageVersionsGenerator } from "./generate-versions";

const IMAGE_COVERS_TMP_FOLDER_PATH = path.join(IMAGE_COVERS_FOLDER_PATH, "tmp");

@Injectable()
export class ImageCoversUploadService {
  constructor(
    private readonly repo: ImageCoversRepository,
    private readonly imageVersionsGenerator: ImageVersionsGenerator,
  ) { }

  async upload(
    { file, uploadDto, uploaderUserId }: UploadFileProps<UploadFileDto>,
  ) {
    let { imageCoverId } = uploadDto.metadata;
    let imageCover!: ImageCoverEntity;

    if (!imageCoverId) {
      assertFoundClient(uploadDto.metadata.label);
      const got = await this.repo.createOneAndGet( {
        metadata: {
          label: uploadDto.metadata.label,
        },
        versions: {
          original: "tmp",
        },
        uploaderUserId,
      } );

      imageCoverId = got.id;
    }

    const newPath = this.moveFile(imageCoverId, file.path);
    const versions = await this.imageVersionsGenerator.generate( {
      filePath: newPath,
    } );

    imageCover = await this.repo.patchOneByIdAndGet(imageCoverId, {
      entity: {
        versions,
      },
    } );

    return createUploadFileSuccessResponse( {
      imageCover,
    } ) as ImageCoverCrudDtos.UploadFile.Response;
  }

  protected moveFile(imageCoverId: string, filename: string) {
    const newFilename = `${imageCoverId}${path.extname(filename)}`;
    const newPath = path.join(IMAGE_COVERS_FOLDER_PATH, imageCoverId.slice(-2), newFilename);
    const targetDir = path.dirname(newPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, {
        recursive: true,
      } );
    }

    fs.renameSync(
      filename,
      newPath,
    );

    return newPath;
  }
}

const ALLOWED_MIMES = ["png", "jpg", "gif", "bmp"].map(getImageMime);

export const uploadFileInterceptorOptions: MulterOptions = {
  storage: diskStorage( {
    destination: diskStorageEnsureDestination(IMAGE_COVERS_TMP_FOLDER_PATH),
    filename: diskStorageUniqueFilename(),
  } ),
  fileFilter: fileMimeTypeFilter(ALLOWED_MIMES),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB por archivo
  },
};

export const UploadFileInterceptor: Type<NestInterceptor> = FileInterceptor(
  "file",
  uploadFileInterceptorOptions,
);
