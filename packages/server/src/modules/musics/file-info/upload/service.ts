import type { UploadMusicFileInfoDto } from "./controller";
import path from "node:path";
import { existsSync } from "node:fs";
import fs from "node:fs";
import { BadRequestException, InternalServerErrorException, NestInterceptor, Type } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { diskStorage } from "multer";
import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import * as mime from "mime-types";
import { FileInterceptor } from "@nestjs/platform-express";
import { MusicFileInfoCrudDtos } from "$shared/models/musics/file-info/dto/transport";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { md5FileAsync } from "#utils/crypt";
import { MusicFileInfoRepository } from "#musics/file-info/crud/repository";
import { createUploadFileSuccessResponse, diskStorageEnsureDestination, diskStorageUniqueFilename, fileMimeTypeFilter, UploadFileProps } from "#utils/files";
import { MusicsRepository } from "../../crud/repositories/music";
import { MusicEntity } from "../../models";
import { MUSIC_MEDIA_PATH } from "../../utils";
import { MusicFileInfoEntity } from "../models";

@Injectable()
export class MusicFileInfoUploadRepository {
  constructor(
    private readonly fileInfosRepo: MusicFileInfoRepository,
    private readonly musicsRepo: MusicsRepository,
  ) { }

  async upload(
    { file,
      uploadDto,
      uploaderUserId }: UploadFileProps<UploadMusicFileInfoDto>,
  ) {
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
        }
      }

      fileInfo = await this.fileInfosRepo.upsertOneByPathAndGet(relativePath, {
        musicId,
        path: relativePath,
        size: file.size,
        hash,
      } );
    } else {
      const got = await this.musicsRepo.createOneFromPath(relativePath, uploaderUserId, {
        size: file.size,
        hash,
      } );

      fileInfo = got.fileInfo;
      music = got.music;
    }

    return createUploadFileSuccessResponse( {
      music,
      fileInfo,
    } ) satisfies MusicFileInfoCrudDtos.UploadFile.Response;
  }
}

// Configuración de almacenamiento
function getMime(ext: string) {
  switch (ext) {
    case "ape": return "audio/x-ape";
    case "m4a": return "audio/x-m4a";
    case "flac": return "audio/flac";
    default: return mime.lookup(ext).toString();
  }
}

export const uploadFileInterceptorOptions: MulterOptions = {
  storage: diskStorage( {
    destination: diskStorageEnsureDestination(path.join(MUSIC_MEDIA_PATH, "upload")),
    filename: diskStorageUniqueFilename(),
  } ),
  fileFilter: fileMimeTypeFilter(AUDIO_EXTENSIONS.map(getMime)),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB por archivo
  },
};

export const UploadFileInterceptor: Type<NestInterceptor> = FileInterceptor(
  "file",
  uploadFileInterceptorOptions,
);
