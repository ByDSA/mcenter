// src/music/raw-handler.service.ts
import { createReadStream, existsSync } from "fs";
import { Injectable, NotFoundException, StreamableFile } from "@nestjs/common";
import { Response } from "express";
import * as mime from "mime-types";
import { assertIsDefined } from "$shared/utils/validation";
import { assertFound } from "#utils/validation/found";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicsRepository } from "../crud/repository";
import { getFullPath } from "../utils";
import { Music } from "../models";

type RangeContentProps = {
  range: string;
  fileSize: number;
  res: Response;
  fullpath: string;
};

@Injectable()
export class SlugHandlerService {
  constructor(
    private readonly musicRepo: MusicsRepository,
    private readonly historyRepo: MusicHistoryRepository,
  ) {}

  async handle(
    slug: string,
    ifNoneMatch: string,
    range: string,
    res: Response,
  ): Promise<StreamableFile | void> {
    const music = await this.musicRepo.getOneBySlug(slug, {
      expand: ["fileInfos"],
    } );

    assertFound(music);

    // 1. Client cache check
    const etag = `"${music.timestamps.updatedAt.getTime()}"`;

    if (ifNoneMatch === etag) {
      res.status(304); // Not modified

      return;
    }

    // 2. File existence
    assertFound(music.fileInfos);
    const fileInfo = music.fileInfos![0];

    assertIsDefined(fileInfo);
    const fullpath = getFullPath(fileInfo.path);

    if (!existsSync(fullpath))
      throw new NotFoundException("File not found");

    // 3. Cabeceras comunes
    this.setCommonHeaders(res, music, fileInfo, etag);

    // 4. Historial
    await this.updateHistory(music.id);

    // 5. Range o descarga completa
    if (range) {
      return this.streamRange( {
        fileSize: fileInfo.size,
        fullpath,
        range,
        res,
      } );
    }

    return this.streamFull(fullpath);
  }

  private setCommonHeaders(
    res: Response,
    music: Music,
    fileInfo: { path: string;
size: number; },
    etag: string,
  ) {
    const ext = fileInfo.path.slice(fileInfo.path.lastIndexOf("."));
    const filename = `${music.artist} - ${music.title}${ext}`;

    res.set( {
      "Content-Type": mime.lookup(fileInfo.path) || "application/octet-stream",
      "Accept-Ranges": "bytes",
      ETag: etag,
      "Last-Modified": music.timestamps.updatedAt.toUTCString(),
      "Cache-Control": "public, max-age=31536000, must-revalidate",
      "Content-Length": fileInfo.size,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(
        filename,
      )}`,
    } );
  }

  private async updateHistory(musicId: string) {
    const isLast = await this.historyRepo.isLast(musicId);

    if (!isLast)
      await this.historyRepo.createOneByMusicId(musicId);
  }

  private streamRange( { fileSize,
    range,
    res,
    fullpath }: RangeContentProps): StreamableFile | undefined {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.status(416).set( {
        "Content-Range": `bytes */${fileSize}`,
      } );
      res.end();

      return;
    }

    res.status(206).set( {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Range",
    } );

    return new StreamableFile(createReadStream(fullpath, {
      start,
      end,
    } ));
  }

  private streamFull(fullpath: string): StreamableFile {
    return new StreamableFile(createReadStream(fullpath));
  }
}
