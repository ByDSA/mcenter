import type { Request } from "express";

export enum ResponseFormat {
  JSON = "json",
  M3U8 = "m3u8",
  RAW = "raw",
}

export function getResponseFormatByRequest(req: Request): ResponseFormat {
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
