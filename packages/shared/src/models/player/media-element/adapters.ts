import type { EpisodeEntityWithFileInfos } from "../../episodes";
import type { MediaElement } from "./media-element";
import type { MusicEntityWithFileInfos } from "../../musics";

export function episodeWithFileInfosToMediaElement(e: EpisodeEntityWithFileInfos): MediaElement {
  const fileInfo = e.fileInfos[0];

  return {
    path: fileInfo.path,
    startTime: fileInfo.start,
    stopTime: fileInfo.end,
    title: e.title,
    type: "video",
  };
}

export function musicWithFileInfosToMediaElement(m: MusicEntityWithFileInfos): MediaElement {
  const fileInfo = m.fileInfos[0];

  return {
    path: fileInfo.path,
    title: m.title,
    type: "audio",
  };
}
