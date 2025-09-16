import type { Request } from "express";
import { EpisodeEntity, episodeEntitySchema } from "../episodes";
import { MusicEntity, musicEntitySchema } from "../musics";
import { MediaElement } from "../player";
import { musicToMediaElement, episodeToMediaElement } from "../player/media-element/adapters";

type Options = NonNullable<Parameters<typeof musicToMediaElement>[1]>;

export {
  Options as M3u8ViewOptions,
};

export function resourceToMediaElement(picked: object, options?: Options): MediaElement {
  const type = getTypeFromObj(picked);

  switch (type) {
    case "audio":
      return musicToMediaElement(picked as MusicEntity, options);
    case "video":
      return episodeToMediaElement(picked as EpisodeEntity, options);
    default:
      throw new Error("Invalid media type for M3U8 generation");
  }
}

type Props = {
  mediaElement: MediaElement;
  host: string;
  req: Request;
};
export function genM3u8PlaylistWithNext( { host, mediaElement, req }: Props) {
  const nextUrl = `${host}${req.url}`;
  const ret = genM3u8Playlist([
    genM3u8Item(mediaElement),
    genNextM3u8Item(nextUrl),
  ]);

  return ret;
}

function getTypeFromObj(obj: object): NonNullable<MediaElement["type"]> {
  if (episodeEntitySchema.safeParse(obj).success)
    return "video";

  if (musicEntitySchema.safeParse(obj).success)
    return "audio";

  throw new Error("Invalid object type for media element");
}

function getHostFromForwardedRequest(req: Request): string {
  const protocol = req.get("x-forwarded-proto") ?? req.protocol;
  const hostname = req.get("host") ?? req.get("x-forwarded-host") ?? req.hostname;
  const portStr = req.get("x-forwarded-port");
  let ret = `${protocol }://`;

  ret += hostname;

  if (portStr
    && ((protocol === "http" && +portStr !== 80) || (protocol === "https" && +portStr !== 443)))
    ret += `:${portStr}`;

  return ret;
}

export function getHostFromRequest(req: Request): string {
  const isForwarded = req.get("x-forwarded-host") !== undefined;

  if (isForwarded)
    return getHostFromForwardedRequest(req);

  return `${req.protocol}://${req.get("host")}`;
}

function genNextM3u8Item(nextUrl: string): string {
  return `#EXTINF:-1,NEXT
${nextUrl}`;
}

export function genM3u8Item(mediaElement: MediaElement): string {
  mediaElement = mediaElementFixPlayerLabels(mediaElement);
  const { artist, path, startTime, length, stopTime, title } = mediaElement;
  const artistOpt = artist ? mediaElement.artist + "," : "";
  const startTimeOpt = startTime ? `\n#EXTVLCOPT:start-time=${startTime}` : "";
  const stopTimeOpt = stopTime ? `\n#EXTVLCOPT:stop-time=${stopTime}` : "";
  const ret = `#EXTINF:${length ?? "-1"},\
${artistOpt}${title ?? "TITLE"}${startTimeOpt}${stopTimeOpt}
${encodeURI(path)}`;

  return ret;
}

export function genM3u8Playlist(items: string[]): string {
  return `#EXTM3U
${items.join("\n")}\n`;
}

export function mediaElementFixPlayerLabels(mediaElement: MediaElement): MediaElement {
  if (mediaElement.title)
    mediaElement.title = fixPlayerLabel(mediaElement.title);

  if (mediaElement.artist)
    mediaElement.artist = fixPlayerLabel(mediaElement.artist);

  return mediaElement;
}

function fixPlayerLabel(txt: string): string {
  return txt.replaceAll(/,/g, "‚") // Coma -> coma de ancho completo
    .replaceAll(/-/g, "－") // Guión -> guión de ancho completo
    .replaceAll(/\|/g, "｜") // Pipe -> pipe de ancho completo
    .replaceAll(/:/g, "：") // Dos puntos -> dos puntos de ancho completo
    .replaceAll(/;/g, "；"); // Punto y coma -> punto y coma de ancho completo
}
