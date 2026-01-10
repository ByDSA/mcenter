import path from "node:path";
import { existsSync } from "node:fs";
import { extname } from "node:path";
import { mkdirSync } from "node:fs";
import * as fs from "fs";
import z from "zod";
import { createZodDto } from "nestjs-zod";
import { BadRequestException, NestInterceptor, Type } from "@nestjs/common";
import { Express } from "express";
import { Injectable } from "@nestjs/common";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import * as mime from "mime-types";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImageCoverEntity } from "$shared/models/image-covers";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { assertIsDefined } from "$shared/utils/validation";
import { ImageCoversRepository } from "./repositories";
import { IMAGE_COVERS_FOLDER_PATH } from "./utils";
import { generateImageVersions } from "./generate-versions";

// eslint-disable-next-line no-underscore-dangle
const _expressType: Express = null as any; // Para que no borre el import de Express
const IMAGE_EXTENSIONS = ["png", "jpg", "gif", "bmp"];
const IMAGE_COVERS_TMP_FOLDER_PATH = path.join(IMAGE_COVERS_FOLDER_PATH, "tmp");

export type UploadFile = Express.Multer.File;

export class UploadFileDto extends createZodDto(
  ImageCoverCrudDtos.UploadFile.requestBodySchema
    .omit( {
      metadata: true,
    } )
    .extend( {
      metadata: z.string().transform((str) => JSON.parse(str))
        .pipe(ImageCoverCrudDtos.UploadFile.requestBodySchema.shape.metadata),
    } ),
) {};

@Injectable()
export class ImageCoversUploadService {
  constructor(
    private readonly repo: ImageCoversRepository,
  ) { }

  async upload(
    file: UploadFile,
    uploadDto: UploadFileDto,
    uploaderUserId: string,
  ) {
    if (!file)
      throw new BadRequestException("No se ha proporcionado archivo");

    const uploadedFile = {
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploadDate: new Date().toISOString(),
    };
    let { imageCoverId } = uploadDto.metadata;
    let imageCover!: ImageCoverEntity;

    if (!imageCoverId) {
      assertIsDefined(uploadDto.metadata.label);
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

    const newFilename = `${imageCoverId}${path.extname(uploadedFile.filename)}`;
    const newPath = path.join(IMAGE_COVERS_FOLDER_PATH, imageCoverId.slice(-2), newFilename);

    fs.renameSync(
      uploadedFile.path,
      newPath,
    );

    uploadedFile.path = newPath;
    uploadedFile.filename = newFilename;

    const versions = await generateImageVersions( {
      filePath: uploadedFile.path,
    } );

    imageCover = await this.repo.patchOneByIdAndGet(imageCoverId, {
      entity: {
        versions,
      },
    } );

    const ret = ImageCoverCrudDtos.UploadFile.responseSchema.parse( {
      message: "Archivo subido exitosamente",
      meta: {
        body: uploadDto,
        file: uploadedFile,
      },
      data: {
        imageCover,
      },
    } );

    return ret;
  }
}

// Configuración de almacenamiento
const storage = diskStorage( {
  destination: (_req, _file, callback) => {
    // Crear directorio si no existe
    if (!existsSync(IMAGE_COVERS_TMP_FOLDER_PATH)) {
      mkdirSync(IMAGE_COVERS_TMP_FOLDER_PATH, {
        recursive: true,
      } );
    }

    callback(null, IMAGE_COVERS_TMP_FOLDER_PATH);
  },
  filename: (_req, file, callback) => {
    const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");
    // Generar nombre único para el archivo
    const uniqueName = `${removeFilenameExtension(originalName)}\
[${uuidv4()}]${extname(originalName)}`;

    callback(null, uniqueName);
  },
} );

function getMime(ext: string) {
  switch (ext) {
    case "jpeg":
    case "jpg": return "image/jpeg";
    case "png": return "image/png";
    case "gif": return "image/gif";
    case "bmp": return "image/bmp";
    default: return mime.lookup(ext);
  }
}

// Filtro para validar tipos de archivo (opcional)
const fileFilter: MulterOptions["fileFilter"] = (_req, file, callback) => {
  const allowedMimes = IMAGE_EXTENSIONS.map(getMime);

  if (allowedMimes.includes(file.mimetype))
    callback(null, true);
  else
    callback(new BadRequestException("Tipo de archivo no permitido"), false);
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UploadFileInterceptor: Type<NestInterceptor> = FileInterceptor("file", {
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB por archivo
  },
} );

function removeFilenameExtension(str: string): string {
  for (const ext of IMAGE_EXTENSIONS) {
    const index = str.lastIndexOf(`.${ext}`);

    if (index >= 0)
      return str.substring(0, index);
  }

  return str;
}
