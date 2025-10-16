import path, { relative } from "node:path";
import fs from "node:fs";
import { Injectable, Logger } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { MusicsRepository } from "#musics/crud/repositories/music";
import { MUSIC_MEDIA_PATH } from "#musics/utils";
import { MusicFileInfoRepository } from "#musics/file-info/crud/repository";
import { DownloadResult, YoutubeDownloadMusicService } from "./youtube-download-music.service";

@Injectable()
export class YoutubeImportMusicService {
  private readonly logger = new Logger(YoutubeImportMusicService.name);

  constructor(
    private readonly musicsRepo: MusicsRepository,
    private readonly musicFileInfosRepo: MusicFileInfoRepository,
    private readonly musicDownloader: YoutubeDownloadMusicService,
  ) {}

  async removeWebpFiles(): Promise<void> {
    const uploadPath = path.join(MUSIC_MEDIA_PATH, "upload/youtube");

    try {
      const files = await fs.promises.readdir(uploadPath);
      const webpFiles = files.filter(file => file.endsWith(".webp"));

      await Promise.all(webpFiles.map(file => fs.promises.unlink(path.join(uploadPath, file))));
    } catch (error) {
      this.logger.warn(
        `Failed to remove .webp files in ${uploadPath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async getPlaylistVideoIds(playlistId: string): Promise<string[]> {
    try {
      const info = await this.musicDownloader.getPlaylistInfo(playlistId);

      return info.map(v => v.id);
    } catch (error) {
      if (!(error instanceof Error))
        throw error;

      const errorMessage = extractErrorMessage(error.message);

      if (errorMessage)
        throw new Error(errorMessage);

      throw error;
    }
  }

  async downloadOne(id: string): Promise<DownloadResult> {
    try {
      return await this.musicDownloader.download(id, {
        outputFolder: path.join(MUSIC_MEDIA_PATH, "upload/youtube"),
        outputName: `%(artist)s - %(title)s [${uuidv4()}]`,
      } );
    } catch (error) {
      await this.removeWebpFiles();

      if (!(error instanceof Error))
        throw error;

      const errorMessage = extractErrorMessage(error.message);

      if (errorMessage)
        throw new Error(errorMessage);

      throw error;
    }
  }

  async createNewMusic(downloadResult: DownloadResult, uploaderUserId: string) {
    const relativePath = path.relative(MUSIC_MEDIA_PATH, downloadResult.fullpath);

    try {
      return await this.musicsRepo.createOneFromPath(relativePath, uploaderUserId);
    } catch (error) {
      await this.deleteDownloadedFile(downloadResult);
      throw error;
    }
  }

  async createNewMusicFileInfo(downloadResult: DownloadResult, musicId: string) {
    const relativePath = relative(MUSIC_MEDIA_PATH, downloadResult.fullpath);

    return await this.musicFileInfosRepo.upsertOneByPathAndGet(relativePath, {
      musicId,
    } );
  }

  async deleteDownloadedFile(downloadResult: DownloadResult) {
    try {
      await fs.promises.unlink(downloadResult.fullpath);
    } catch {
      this.logger.warn(
        `Failed to delete downloaded file: ${downloadResult.fullpath}`,
      );
    }
  }
}

function extractErrorMessage(output: string): string | null {
  const errorPrefix = "ERROR: ";
  const errorIndex = output.indexOf(errorPrefix);

  if (errorIndex === -1)
    return null;

  const startIndex = errorIndex + errorPrefix.length;
  const nextNewlineIndex = output.indexOf("\n", startIndex);

  if (nextNewlineIndex === -1) {
    // Si no hay salto de línea después del ERROR:, tomar hasta el final
    return output.substring(startIndex);
  }

  return output.substring(startIndex, nextNewlineIndex);
}
