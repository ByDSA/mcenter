import { createReadStream, existsSync, statSync } from "node:fs";
import { HttpStatus, Injectable, NotFoundException, StreamableFile } from "@nestjs/common";
import { Request, Response } from "express";
import * as mime from "mime-types";

type StreamingOptions = {
  lastModified: Date;
  size?: number;
  req: Request;
  res: Response;
  fullpath: string;
  customFilename: string;
};

@Injectable()
export class StreamFileService {
  // eslint-disable-next-line require-await
  async handle(
    options: StreamingOptions,
  ): Promise<StreamableFile | void> {
    const { lastModified, fullpath, size, req, res, customFilename } = options;
    const ifNoneMatch = req.headers["if-none-match"] as string;
    const range = req.headers.range as string;
    // 1. Client cache check
    const etag = `"${lastModified.getTime()}"`;

    if (ifNoneMatch === etag) {
      res.status(HttpStatus.NOT_MODIFIED);

      return;
    }

    // 2. File existence
    if (!existsSync(fullpath))
      throw new NotFoundException("File not found");

    // 3. Headers
    this.setCommonHeaders(res, lastModified, fullpath, etag, customFilename);

    // 4. File streaming
    let fileSize: number = size ?? 0;

    if (fileSize <= 0)
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
        "Content-Length": fileSize,
      } );
    }

    return this.streamFull(fullpath, fileSize);
  }

  private setCommonHeaders(
    res: Response,
    lastModified: Date,
    path: string,
    etag: string,
    filename: string,
  ) {
    res.set( {
      "Content-Type": mime.lookup(path) || "application/octet-stream",
      "Accept-Ranges": "bytes",
      ETag: etag,
      "Last-Modified": lastModified.toUTCString(),
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
