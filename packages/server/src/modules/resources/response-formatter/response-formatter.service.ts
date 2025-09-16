import { Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { ResponseFormat } from "$shared/models/resources/response-format.enum";
import { mediaElementWithAbsolutePath } from "$shared/models/player";
import { genM3u8Item, getHostFromRequest, M3u8ViewOptions, resourceToMediaElement, genM3u8Playlist, genM3u8PlaylistWithNext } from "$shared/models/resources/m3u8.view";

export type FormatResponseOptions = M3u8ViewOptions & {
  m3u8UseNext?: boolean;
};

export type M3u8Props = {
  data: object;
  request: Request;
  response: Response;
  options: FormatResponseOptions;
};

@Injectable()
export class ResponseFormatterService {
  getResponseFormatByRequest(req: Request): ResponseFormat {
    const queryFormat = req.query.format as string | undefined;

    if (queryFormat) {
      switch (queryFormat.toLowerCase()) {
        case "json":
          return ResponseFormat.JSON;
        case "m3u8":
          return ResponseFormat.M3U8;
        case "raw":
          return ResponseFormat.RAW;
        default:
          break; // ignore
      }
    }

    const userAgent = req.headers["user-agent"] ?? "";
    const isPlayer = isMediaPlayer(userAgent);

    if (isPlayer)
      return ResponseFormat.M3U8;

    const accept = req.headers.accept ?? "";

    if (accept.includes("application/json"))
      return ResponseFormat.JSON;

    if (accept.includes("application/vnd.apple.mpegurl") || accept.includes("application/x-mpegURL"))
      return ResponseFormat.M3U8;

    return ResponseFormat.JSON;
  }

  formatM3u8Response( { data,
    request,
    response,
    options }: M3u8Props) {
    response.setHeader("Content-Type", "application/x-mpegURL");

    const useNext = options?.m3u8UseNext ?? false;
    let mediaElement = resourceToMediaElement(data, options);
    const host = getHostFromRequest(request);

    if (!options.local) {
      const prefix = host;

      mediaElement = mediaElementWithAbsolutePath(mediaElement, prefix);
    }

    if (useNext) {
      return genM3u8PlaylistWithNext( {
        mediaElement,
        req: request,
        host,
      } );
    }

    return genM3u8Playlist([
      genM3u8Item(mediaElement),
    ]);
  }

  formatOneRemoteM3u8Response(
    data: object,
    host: string,
    options?: Omit<M3u8ViewOptions, "local" | "prefix">,
  ) {
    const mediaElement = resourceToMediaElement(data, {
      ...options,
      prefix: host,
    } );

    return genM3u8Playlist([
      genM3u8Item(mediaElement),
    ]);
  }

  formatManyRemoteM3u8Response(
    data: object[],
    host: string,
    options?: Omit<M3u8ViewOptions, "local" | "prefix">,
  ) {
    const items = data.map(d=>genM3u8Item(resourceToMediaElement(d, {
      ...options,
      prefix: host,
    } )));

    return genM3u8Playlist(items);
  }

  formatOneJsonResponse(data: object, response: Response) {
    response.setHeader("Content-Type", "application/json");

    return createSuccessResultResponse(data);
  }
}

function isMediaPlayer(userAgent: string): boolean {
  const mediaPlayers = [
    /VLC/i,
    /iTunes/i,
    /foobar2000/i,
    /Winamp/i,
    /mpv/i,
    /MPlayer/i,
    /XBMC/i,
    /Kodi/i,
  ];

  return mediaPlayers.some(pattern => pattern.test(userAgent));
}
