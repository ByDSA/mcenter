import type { EpisodeEntity } from "../../episodes";
import type { MediaElement } from "./media-element";
import type { MusicEntity } from "../../musics";
import { EpisodeFileInfoEntity } from "src/models/episodes/file-info";
import { PATH_ROUTES } from "../../../routing";
import { ResponseFormat } from "../../resource";
import { assertIsDefined } from "../../../utils/validation";

type Options = {
  local?: boolean;
  prefix?: string;
};

export function episodeToMediaElement(
  episode: EpisodeEntity,
  options?: Options,
): MediaElement {
  const artist = episode.serie?.name ?? episode.compKey.seriesKey;
  const title = `${episode.compKey.episodeKey} - ${episode.title}`;
  const fileInfo = episode.fileInfos?.[0];
  const length = calculateEpisodeFileInfoLength(fileInfo);
  const isLocal = options?.local ?? false;
  let path: string;

  if (isLocal) {
    assertIsDefined(fileInfo);
    path = fileInfo.path;
  } else {
    path = PATH_ROUTES.episodes.slug.withParams(
      episode.compKey.seriesKey,
      episode.compKey.episodeKey,
      {
        format: ResponseFormat.RAW,
      },
    );
  }

  return {
    path: options?.prefix ? new URL(path, options.prefix).toString() : path,
    artist,
    title,
    type: "video",
    length,
    startTime: fileInfo?.start,
    stopTime: fileInfo?.end,
  };
}

export function musicToMediaElement(music: MusicEntity, options?: Options): MediaElement {
  const { artist } = music;
  const { title } = music;
  const fileInfo = music.fileInfos?.[0];
  const length = Math.round(fileInfo?.mediaInfo.duration ?? -1);
  const isLocal = options?.local ?? false;
  let path: string;

  if (isLocal) {
    assertIsDefined(fileInfo);
    path = fileInfo.path;
  } else {
    path = PATH_ROUTES.musics.slug.withParams(music.slug, {
      format: ResponseFormat.RAW,
    } );
  }

  return {
    path: options?.prefix ? new URL(path, options.prefix).toString() : path,
    artist,
    title,
    type: "audio",
    length,
  };
}

function calculateEpisodeFileInfoLength(fileInfo?: EpisodeFileInfoEntity): number {
  if (!fileInfo)
    return -1;

  const { end } = fileInfo;
  const start = fileInfo.start ?? 0;

  if (end === undefined)
    return Math.round(fileInfo.mediaInfo.duration ?? -1);

  return end - start;
}
