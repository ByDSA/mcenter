import { Request } from "express";
import { MediaElement } from "$shared/models/player";
import { PATH_ROUTES } from "$shared/routing";
import { EpisodeEntity, episodeEntitySchema } from "#episodes/models";
import { MusicEntity, musicEntitySchema } from "../models";

type Props = {
req: Request;
picked: EpisodeEntity | MusicEntity;
useNext: boolean;
};
export function genM3u8View( { req, picked, useNext }: Props) {
  const nextHost = getHostFromRequest(req);
  let mediaElement;
  const type = getTypeFromObj(picked);

  switch (type) {
    case "audio":
      mediaElement = musicToMediaElement(picked as MusicEntity, {
        server: nextHost,
      } );
      break;
    case "video":
      mediaElement = episodeToMediaElement(picked as EpisodeEntity, {
        server: nextHost,
      } );
      break;
    default:
      throw new Error("Invalid media type for M3U8 generation");
  }

  if (useNext) {
    const nextUrl = `${nextHost}${req.url}`;

    return generatePlaylist( {
      mediaElement,
      nextUrl,
    } );
  } else
    return generateItemPlaylist(mediaElement);
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

function getHostFromRequest(req: Request): string {
  const isForwarded = req.get("x-forwarded-host") !== undefined;

  if (isForwarded)
    return getHostFromForwardedRequest(req);

  return `${req.protocol}://${req.get("host")}`;
}

type Options = {
  server: string;
};

function musicToMediaElement(music: MusicEntity, options?: Options): MediaElement {
  const artist = fixTxt(music.artist);
  const title = fixTxt(music.title);
  const duration = Math.round(music.fileInfos?.[0].mediaInfo.duration ?? -1);

  return {
    path: `${options?.server}${PATH_ROUTES.musics.slug.withParams(music.slug)}?format=raw`,
    artist,
    title,
    type: "audio",
    length: duration,
  };
}
function episodeToMediaElement(episode: EpisodeEntity, _options?: Options): MediaElement {
  const artist = fixTxt(episode.serie?.name ?? episode.compKey.seriesKey);
  const title = fixTxt(episode.title);
  const fileInfo = episode.fileInfos?.[0];
  const duration = Math.round(fileInfo?.mediaInfo.duration ?? -1);
  const path = fileInfo?.path;

  return {
    path: `${path}`,
    artist,
    title,
    type: "audio",
    length: duration,
  };
}

type GenPlayListParams = {
  mediaElement: MediaElement;
  nextUrl: string;
};
function generatePlaylist( { mediaElement, nextUrl }: GenPlayListParams): string {
  const ret = `${generateItemPlaylist(mediaElement)}
${nextM3u8(nextUrl)}`;

  return ret;
}

function nextM3u8(nextUrl: string): string {
  return `#EXTINF:-1,NEXT
${nextUrl}`;
}

function generateItemPlaylist(mediaElement: MediaElement): string {
  const artist = fixTxt(mediaElement.artist ?? "");
  const title = fixTxt(mediaElement.title ?? "");
  const duration = mediaElement.length;
  const ret = `#EXTM3U
#EXTINF:${duration},${artist},${title}
${mediaElement.path}`;

  return ret;
}

function fixTxt(txt: string): string {
  return txt.replace(/,/g, "﹐");
}
