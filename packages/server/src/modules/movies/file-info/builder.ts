import { statSync } from "fs";
import { md5FileAsync } from "#utils/crypt";
import { getAbsolutePath } from "../utils";
import { MovieFileInfoOmitMovieId } from "./models";
import { getVideoInfo } from "./video-info";

type InfoWithPath = Partial<MovieFileInfoOmitMovieId> & Pick<MovieFileInfoOmitMovieId, "path">;

export class MovieFileInfoOmitMovieIdBuilder {
  private info: InfoWithPath = {} as any;

  withPartial(partial: InfoWithPath) {
    Object.assign(this.info, partial);

    return this;
  }

  withFileWithStats( { path, size, hash, timestamps, mediaInfo }: MovieFileInfoOmitMovieId) {
    this.info.path = path;
    this.info.size = size;
    this.info.mediaInfo = mediaInfo;
    this.info.timestamps = {
      createdAt: timestamps.createdAt,
      updatedAt: timestamps.updatedAt,
    };

    if (hash)
      this.info.hash = hash;

    return this;
  }

  async build(): Promise<MovieFileInfoOmitMovieId> {
    // 1. Path obligatorio
    if (!this.info.path)
      throw new Error("MovieFileInfoBuilder: falta la propiedad path");

    const fullPath = getAbsolutePath(this.info.path);

    // 2. Si no tenemos stats, los obtenemos
    if (
      !("size" in this.info) || !this.info.timestamps?.createdAt || !this.info.timestamps?.updatedAt
    ) {
      const { mtime, ctime, size } = statSync(fullPath);

      this.info.size ??= size;
      this.info.timestamps ??= {} as any;
      this.info.timestamps!.createdAt ??= new Date(ctime);
      this.info.timestamps!.updatedAt ??= new Date(mtime);
    }

    // 3. Si falta hash, lo calculamos
    if (!this.info.hash)
      this.info.hash = await md5FileAsync(fullPath);

    // 4. Media info de vídeo
    if (!this.info.mediaInfo) {
      const vi = await getVideoInfo(fullPath);

      this.info.mediaInfo = {
        duration: vi.duration ?? null,
        resolution: {
          width: vi.resolution?.width ?? null,
          height: vi.resolution?.height ?? null,
        },
        fps: vi.fps ?? null,
      };
    }

    return this.info as MovieFileInfoOmitMovieId;
  }
}
