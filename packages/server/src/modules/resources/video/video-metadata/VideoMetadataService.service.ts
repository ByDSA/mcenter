import * as fs from "node:fs";
import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import ffmpeg from "fluent-ffmpeg";
import { md5FileAsync } from "#utils/crypt";
import { EpisodeFileInfo } from "#episodes/file-info/models";

type Options = {
  precalculated?: {
    hash?: string;
  };
};

type VideoInfoResult = Omit<EpisodeFileInfo, "end" | "episodeId" | "path" | "start">;

@Injectable()
export class VideoMetadataService {
  private readonly logger = new Logger(VideoMetadataService.name);

  async getVideoInfo(fullFilePath: string, options?: Options): Promise<VideoInfoResult> {
    return await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(fullFilePath, async (err, metadata) => {
        if (err) {
          if (err instanceof Error && err.message.includes("Cannot find ffprobe")) {
            const newError = new InternalServerErrorException(err.message);

            newError.stack = err.stack;

            return reject(newError);
          }

          return reject(err);
        }

        if (!metadata)
          return reject(new InternalServerErrorException("No metadata found for the video file."));

        try {
          // Extraemos la información técnica
          const duration = metadata.format?.duration ?? null;
          const stream = metadata.streams[0];
          const resolution = {
            width: stream?.width ?? null,
            height: stream?.height ?? null,
          };
          const fps = stream?.r_frame_rate ?? null;
          // Información del sistema de archivos
          const { mtime, ctime, size } = fs.statSync(fullFilePath);
          const createdAt = new Date(ctime);
          const updatedAt = new Date(mtime);

          this.logger.log(`Got metadata of: ${fullFilePath}`);

          // Construcción del objeto de retorno
          const result: VideoInfoResult = {
            hash: options?.precalculated?.hash ?? (await md5FileAsync(fullFilePath)),
            size,
            timestamps: {
              createdAt,
              updatedAt,
            },
            mediaInfo: {
              duration,
              resolution,
              fps,
            },
          };

          resolve(result);
        } catch (processError) {
          if (processError instanceof Error)
            this.logger.error(`Error processing metadata for ${fullFilePath}`, processError.stack);

          reject(processError);
        }
      } );
    } );
  }
}
