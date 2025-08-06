import { createReadStream, existsSync, statSync } from "fs";
import { HttpStatus, Injectable, NotFoundException, StreamableFile } from "@nestjs/common";
import { Request, Response } from "express";
import * as mime from "mime-types";
import { assertIsDefined, isDefined } from "$shared/utils/validation";
import { assertFound } from "#utils/validation/found";

type FileInfo = {
  path: string;
  size: number;
};

type Entity<F extends FileInfo> = {
  timestamps: {
    updatedAt: Date;
  };
  fileInfos?: Array<F>;
};

interface StreamingOptions<T, F> {
  entity: T;
  req: Request;
  res: Response;
  getAbsolutePath: (relativePath: string)=> string;
  generateFilename: (entity: T, fileInfo: F)=> string;
}

@Injectable()
export class ResourceSlugService {
  // eslint-disable-next-line require-await
  async handle<T extends Entity<F>, F extends FileInfo>(
    options: StreamingOptions<T, F>,
  ): Promise<StreamableFile | void> {
    const { entity, req, res, generateFilename } = options;
    const ifNoneMatch = req.headers["if-none-match"] as string;
    const range = req.headers.range as string;
    // 1. Client cache check
    const etag = `"${entity.timestamps.updatedAt.getTime()}"`;

    if (ifNoneMatch === etag) {
      res.status(HttpStatus.NOT_MODIFIED);

      return;
    }

    // 2. File existence
    assertFound(entity.fileInfos);
    const fileInfo = entity.fileInfos![0];

    assertIsDefined(fileInfo);
    const fullpath = options.getAbsolutePath(fileInfo.path);

    if (!existsSync(fullpath))
      throw new NotFoundException("File not found");

    // 3. Headers
    this.setCommonHeaders<T, F>(res, entity, fileInfo, etag, generateFilename);

    // 4. File streaming
    let fileSize: number = fileInfo.size;

    if (!isDefined(fileInfo.size) || fileInfo.size <= 0)
      fileSize = statSync(fullpath).size;

    if (range) {
      return this.streamRange( {
        fileSize,
        fullpath,
        range,
        res,
      } );
    }

    if (fileSize !== undefined) {
      res.set( {
        "Content-Length": fileInfo.size,
      } );
    }

    return this.streamFull(fullpath, fileSize);
  }

  private setCommonHeaders<T extends Entity<F>, F extends FileInfo>(
    res: Response,
    entity: T,
    fileInfo: F,
    etag: string,
    generateFilename: (entity: T, fileInfo: F)=> string,
  ) {
    const filename = generateFilename(entity, fileInfo);

    res.set( {
      "Content-Type": mime.lookup(fileInfo.path) || "application/octet-stream",
      "Accept-Ranges": "bytes",
      ETag: etag,
      "Last-Modified": entity.timestamps.updatedAt.toUTCString(),
      "Cache-Control": "public, max-age=31536000, must-revalidate",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
    } );
  }

  private streamRange( { fileSize,
    range,
    res,
    fullpath }: {
    range: string;
    fileSize: number;
    res: Response;
    fullpath: string;
  } ): StreamableFile | undefined {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = +startStr;
    const end = endStr ? +endStr : fileSize - 1;

    if (start >= fileSize || end >= fileSize || start > end) {
      res.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE).set( {
        "Content-Range": `bytes */${fileSize}`,
      } );
      res.end();

      return;
    }

    const contentLength = end - start + 1;

    res.status(HttpStatus.PARTIAL_CONTENT).set( {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Content-Length": contentLength.toString(),
    } );

    return new StreamableFile(createReadStream(fullpath, {
      start,
      end,
    } ));
  }

  private streamFull(fullpath: string, length?: number): StreamableFile {
    const options = length !== undefined
      ? {
        length,
      }
      : undefined;

    return new StreamableFile(createReadStream(fullpath), options);
  }
}
