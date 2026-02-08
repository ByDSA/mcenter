import type { UploadEpisodeFileInfoDto } from "./controller";
import path from "node:path";
import { existsSync } from "node:fs";
import fs from "node:fs";
import { BadRequestException, NestInterceptor, Type } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { diskStorage } from "multer";
import * as mime from "mime-types";
import { FileInterceptor } from "@nestjs/platform-express";
import { EpisodeFileInfoCrudDtos } from "$shared/models/episodes/file-info/dto/transport";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { v4 as uuidv4 } from "uuid";
import { VIDEO_EXTENSIONS } from "$shared/models/episodes/video-extensions";
import { md5FileAsync } from "#utils/crypt";
import { createUploadFileSuccessResponse, diskStorageEnsureDestination, diskStorageUniqueFilename, fileMimeTypeFilter, UploadFile, UploadFileProps } from "#utils/files";
import { EpisodesRepository } from "#episodes/crud/repositories/episodes";
import { assertFoundClient } from "#utils/validation/found";
import { EpisodeEntity } from "#episodes/models";
import { getSeasonNumberByEpisodeKey, SeriesRepository } from "#episodes/series/crud/repository/repository";
import { VideoMetadataService } from "#modules/resources/video/video-metadata/VideoMetadataService.service";
import { EpisodeFileInfoRepository } from "../crud/repository";
import { EPISODES_MEDIA_PATH, EPISODES_MEDIA_UPLOAD_FOLDER_PATH } from "./utils";

@Injectable()
export class EpisodeFileInfoUploadService {
  constructor(
    private readonly fileInfosRepo: EpisodeFileInfoRepository,
    private readonly episodesRepo: EpisodesRepository,
    private readonly seriesRepo: SeriesRepository,
    private readonly videoMetadata: VideoMetadataService,
  ) { }

  async upload(
    { file,
      uploadDto,
      uploaderUserId }: UploadFileProps<UploadEpisodeFileInfoDto>,
  ) {
    let episode: EpisodeEntity | null = null;
    let seriesId: string | undefined;
    let episodeKey: string | undefined;
    let hash: string | undefined;

    if ("episodeId" in uploadDto.metadata) {
      const { episodeId } = uploadDto.metadata;

      episode = await this.episodesRepo.getOneById(episodeId);

      assertFoundClient(episode);
    } else {
      episode = await this.episodesRepo.getOne( {
        filter: {
          episodeKey: uploadDto.metadata.episodeKey,
          seriesId: uploadDto.metadata.seriesId,
        },
      } );
      seriesId = uploadDto.metadata.seriesId;
      episodeKey = uploadDto.metadata.episodeKey;
    }

    if (episode) {
      await this.checkDuplicated(file, episode.id);

      if (!seriesId)
        seriesId = episode.seriesId;

      if (!episodeKey)
        episodeKey = episode.episodeKey;
    }

    assertFoundClient(episodeKey);
    assertFoundClient(seriesId);

    const season = getSeasonNumberByEpisodeKey(episodeKey);
    let series = await this.seriesRepo.getOneById(seriesId);

    assertFoundClient(series);
    const targetDir = path.join(EPISODES_MEDIA_PATH, series.key, season.toString());

    if (!existsSync(targetDir)) {
      await fs.promises.mkdir(targetDir, {
        recursive: true,
      } );
    }

    const newName = `${path.parse(file.filename).name} [${uuidv4()}]${path.extname(file.filename)}`;
    const newAbsolutePath = path.join(targetDir, newName);
    let relativePath = path.relative(EPISODES_MEDIA_PATH, newAbsolutePath);

    await fs.promises.rename(file.path, newAbsolutePath);

    if (!episode) {
      let title = (uploadDto?.metadata as any)?.title as string | undefined;

      if (!title)
        title = episodeKey;

      episode = await this.episodesRepo.createOneAndGet( {
        episodeKey,
        seriesId,
        title,
        uploaderUserId,
      } );
    }

    const videoInfo = await this.videoMetadata.getVideoInfo(newAbsolutePath, {
      precalculated: {
        hash,
      },
    } );
    const fileInfo = await this.fileInfosRepo.createOneAndGet( {
      episodeId: episode.id,
      path: relativePath,
      size: videoInfo.size,
      hash: videoInfo.hash,
      timestamps: {
        createdAt: videoInfo.timestamps.createdAt,
        updatedAt: videoInfo.timestamps.updatedAt,
      },
      mediaInfo: {
        duration: videoInfo.mediaInfo.duration,
        fps: videoInfo.mediaInfo.fps,
        resolution: {
          width: videoInfo.mediaInfo.resolution.width,
          height: videoInfo.mediaInfo.resolution.height,
        },
      },
    } );

    return createUploadFileSuccessResponse( {
      fileInfo,
      episode,
    } satisfies EpisodeFileInfoCrudDtos.UploadFile.Response["data"]);
  }

  private async checkDuplicated(file: UploadFile, episodeId: string) {
    const hash = await md5FileAsync(file.path);
    const matchHashFileInfos = await this.fileInfosRepo.getManyByHash(hash);

    for (const m of matchHashFileInfos) {
      if (m.episodeId === episodeId)
        throw new BadRequestException("El archivo ya existe para este episodio");
    }

    return {
      hash,
    };
  }
}

export function getVideoMime(ext: string) {
  switch (ext) {
    case "mkv": return "video/x-matroska";
    case "mp4": return "video/mp4";
    case "avi": return "video/x-msvideo";
    default: return mime.lookup(ext).toString();
  }
}

export const uploadFileInterceptorOptions: MulterOptions = {
  storage: diskStorage( {
    destination: diskStorageEnsureDestination(EPISODES_MEDIA_UPLOAD_FOLDER_PATH),
    filename: diskStorageUniqueFilename(),
  } ),
  fileFilter: fileMimeTypeFilter(VIDEO_EXTENSIONS.map(getVideoMime)),
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB por archivo
  },
};

export const UploadFileInterceptor: Type<NestInterceptor> = FileInterceptor(
  "file",
  uploadFileInterceptorOptions,
);
