import path, { extname } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import fs from "node:fs";
import { Express } from "express";
import { Controller, Post, UseInterceptors, BadRequestException, HttpStatus, HttpCode, Body, UploadedFile, InternalServerErrorException } from "@nestjs/common";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import * as mime from "mime-types";
import { createZodDto } from "nestjs-zod";
import z from "zod";
import { FileInterceptor } from "@nestjs/platform-express/multer";
import { md5FileAsync } from "#utils/crypt";
import { MUSIC_MEDIA_PATH } from "../utils";
import { MusicsRepository } from "../crud/repository";
import { MusicEntity } from "../models";
import { MusicFileInfoRepository } from "./crud/repository";
import { MusicFileInfoEntity } from "./models";

// eslint-disable-next-line no-underscore-dangle
const _expressType: Express = null as any; // Para que no borre el import de Express

type File = Express.Multer.File;

class UploadMusicFileInfoDto extends createZodDto(z.object( {
  metadata: z.string().transform((str) => JSON.parse(str))
    .pipe(z.object( {
      musicId: z.string().optional(),
    } )),
} )) {};
// Configuración de almacenamiento
const storage = diskStorage( {
  destination: (_req, _file, callback) => {
    const uploadPath = path.join(MUSIC_MEDIA_PATH, "upload");

    // Crear directorio si no existe
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, {
        recursive: true,
      } );
    }

    callback(null, uploadPath);
  },
  filename: (_req, file, callback) => {
    // Generar nombre único para el archivo
    const uniqueName = `${file.originalname}[${uuidv4()}]${extname(file.originalname)}`;

    callback(null, uniqueName);
  },
} );

function getMime(ext: string) {
  switch (ext) {
    case "ape": return "audio/ape";
    case "m4a": return "audio/x-m4a";
    default: return mime.lookup(ext);
  }
}

// Filtro para validar tipos de archivo (opcional)
const fileFilter: MulterOptions["fileFilter"] = (_req, file, callback) => {
  const allowedMimes = AUDIO_EXTENSIONS.map(getMime);

  if (allowedMimes.includes(file.mimetype))
    callback(null, true);
  else
    callback(new BadRequestException("Tipo de archivo no permitido"), false);
};

@Controller()
export class UploadMusicFileInfoController {
  constructor(
    private readonly fileInfosRepo: MusicFileInfoRepository,
    private readonly musicsRepo: MusicsRepository,
  ) {}

  @Post("upload")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor("file", {
      storage,
      fileFilter,
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB por archivo
      },
    } ),
  )
  async uploadFile(
    @UploadedFile() file: File,
    @Body() uploadDto: UploadMusicFileInfoDto,
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
    const { musicId } = uploadDto.metadata;
    let relativePath = path.relative(MUSIC_MEDIA_PATH, file.path);
    let fileInfo: MusicFileInfoEntity | undefined;
    let music: MusicEntity | undefined;
    const hash = await md5FileAsync(file.path);

    fileInfo = await this.fileInfosRepo.getOneByHash(hash) ?? undefined;

    if (fileInfo) {
      if (fileInfo.musicId === musicId)
        throw new BadRequestException("El archivo ya existe");
      else
        throw new BadRequestException("El archivo ya existe asignado a otra música");
    }

    if (musicId) {
      const previousFileInfos = await this.fileInfosRepo.getAllByMusicId(musicId);

      // Mover archivo a la  misma carpeta que el primer prevfileinfo
      if (previousFileInfos.length > 0) {
        const firstFileInfo = previousFileInfos[0];
        const newDir = path.dirname(firstFileInfo.path);

        relativePath = path.join(newDir, file.filename);

        const newAbsolutePath = path.join(MUSIC_MEDIA_PATH, relativePath);

        if (newAbsolutePath !== file.path) {
          if (existsSync(newAbsolutePath)) {
            throw new InternalServerErrorException(
              "No se pudo mover el archivo, ya existe uno con el mismo nombre",
            );
          }

          await fs.promises.rename(file.path, newAbsolutePath);

          // Actualizar la ruta del archivo subido
          uploadedFile.path = newAbsolutePath;
        }
      }

      fileInfo = await this.fileInfosRepo.upsertOneByPathAndGet(relativePath, {
        musicId,
        path: relativePath,
        size: file.size,
        hash,
      } );
    } else {
      const got = await this.musicsRepo.createOneFromPath(relativePath, {
        size: file.size,
        hash,
      } );

      fileInfo = got.fileInfo;
      music = got.music;
    }

    return {
      message: "Archivo subido exitosamente",
      meta: {
        body: uploadDto,
        file: uploadedFile,
      },
      data: {
        music,
        fileInfo,
      },
    };
  }
}
