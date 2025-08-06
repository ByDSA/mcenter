import { Request } from "express";
import { MediaElement } from "$shared/models/player";
import { musicToMediaElement, episodeToMediaElement } from "$shared/models/player/media-element/adapters";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { MusicEntity, musicEntitySchema } from "../../musics/models";

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
export function genM3u8ItemWithNext( { host, mediaElement, req }: Props) {
  const nextUrl = `${host}${req.url}`;

  return generatePlaylist( {
    mediaElement,
    nextUrl,
  } );
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

type GenPlayListParams = {
  mediaElement: MediaElement;
  nextUrl: string;
};
function generatePlaylist( { mediaElement, nextUrl }: GenPlayListParams): string {
  const ret = `${genM3u8Item(mediaElement)}
${nextM3u8(nextUrl)}`;

  return ret;
}

function nextM3u8(nextUrl: string): string {
  return `#EXTINF:-1,NEXT
${nextUrl}`;
}

export function genM3u8Item(mediaElement: MediaElement): string {
  mediaElement = mediaElementFixPlayerLabels(mediaElement);
  const artist = mediaElement.artist ?? "";
  const title = mediaElement.title ?? "";
  const duration = mediaElement.length;
  const ret = `#EXTM3U
#EXTINF:${duration},${artist},${title}
${mediaElement.path}`;

  return ret;
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
