import { Injectable } from "@nestjs/common";
import { Request, Response } from "express";
import { createSuccessResultResponse } from "$shared/utils/http/responses";
import { ResponseFormat } from "$shared/models/resources/response-format.enum";
import { episodeToMediaElement, mediaElementWithAbsolutePath } from "$shared/models/player/media-element";
import { genM3u8Item, getHostFromRequest, genM3u8Playlist, genM3u8PlaylistWithNext } from "$shared/models/resources/m3u8.view";
import { isMediaPlayerUserAgent } from "$shared/utils/http/user-agent";
import { type M3u8ViewOptions } from "./retource-to-media-element";
import { EpisodeEntity } from "#episodes/models";

export type FormatResponseOptions = M3u8ViewOptions & {
  m3u8UseNext?: boolean;
};

export type M3u8Props = {
  episode: EpisodeEntity;
  serieName: string;
  request: Request;
  response: Response;
  options: FormatResponseOptions;
};

@Injectable()
export class EpisodeResponseFormatterService {
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
    const isPlayer = isMediaPlayerUserAgent(userAgent);

    if (isPlayer)
      return ResponseFormat.M3U8;

    const accept = req.headers.accept ?? "";

    if (accept.includes("application/json"))
      return ResponseFormat.JSON;

    if (accept.includes("application/vnd.apple.mpegurl") || accept.includes("application/x-mpegURL"))
      return ResponseFormat.M3U8;

    return ResponseFormat.JSON;
  }

  formatM3u8Response( { episode,
    serieName,
    request,
    response,
    options }: M3u8Props) {
    response.setHeader("Content-Type", "application/x-mpegURL");

    const useNext = options?.m3u8UseNext ?? false;
    let mediaElement = episodeToMediaElement(episode, serieName, options);
    const host = getHostFromRequest(request);

    if (!options.local) {
      const prefix = host;

      mediaElement = mediaElementWithAbsolutePath(mediaElement, prefix);
    }

    // add query to path
    const ignoreItems = ["format", "q"];
    const urlObj = new URL(request.url, "http://dummy.com");
    const queryParams = new URLSearchParams(urlObj.search);

    ignoreItems.forEach(key => {
      queryParams.delete(key);
    } );

    const filteredQuery = queryParams.toString(); // genera "a=1&b=2" sin los ignorados

    if (filteredQuery) {
      const separator = mediaElement.path.includes("?") ? "&" : "?";

      mediaElement.path += separator + filteredQuery;
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
    episode: EpisodeEntity,
    serieName: string,
    host: string,
    options?: Omit<M3u8ViewOptions, "local" | "prefix">,
  ) {
    const mediaElement = episodeToMediaElement(episode, serieName, {
      ...options,
      prefix: host,
    } );

    return genM3u8Playlist([
      genM3u8Item(mediaElement),
    ]);
  }

  formatManyRemoteM3u8Response(
    data: {episode: EpisodeEntity;
seriesName: string;}[],
    host: string,
    options?: Omit<M3u8ViewOptions, "local" | "prefix">,
  ) {
    const items = data.map(d=>genM3u8Item(episodeToMediaElement(d.episode, d.seriesName, {
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
