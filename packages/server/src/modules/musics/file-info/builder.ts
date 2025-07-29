import { statSync } from "fs";
import { md5FileAsync } from "#utils/crypt";
import { getFullPath } from "../utils";
import { FileWithStats } from "../update-remote/ChangesDetector";
import { MusicFileInfoOmitMusicId } from "./models";

type InfoWithPath = Partial<MusicFileInfoOmitMusicId> & Pick<MusicFileInfoOmitMusicId, "path">;
export class MusicFileInfoOmitMusicIdBuilder {
  private info: InfoWithPath = {} as any;

  withPartial(partial: InfoWithPath) {
    Object.assign(this.info, partial);

    return this;
  }

  withFileWithStats( { path, stats, hash }: FileWithStats) {
    this.info.path = path;
    this.info.size = stats.size;
    this.info.timestamps = {
      createdAt: stats.ctime,
      updatedAt: stats.mtime,
    };

    if (hash)
      this.info.hash = hash;

    return this;
  }

  async build(): Promise<MusicFileInfoOmitMusicId> {
    // 1. Path obligatorio
    if (!this.info.path)
      throw new Error("MusicFileInfoBuilder: falta la propiedad path");

    const fullPath = getFullPath(this.info.path);

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

    // 4. Media info por defecto
    this.info.mediaInfo ??= {
      duration: null,
    };

    // 5. Devolvemos con todos los campos “definitivos”
    return this.info as MusicFileInfoOmitMusicId;
  }
}
