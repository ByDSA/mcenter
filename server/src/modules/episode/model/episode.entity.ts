import dotenv from "dotenv";
import { MediaElement } from "#modules/player/m3u/MediaElement";

export default interface Episode {
  id: string;
  title: string;
  path: string;
  weight: number;
  start: number;
  end: number;
  tags?: string[];
  duration?: number;
  disabled?: boolean;
}

export function episodeToMediaElement(e: Episode): MediaElement {
  dotenv.config();
  const { MEDIA_PATH } = process.env;

  return {
    path: `${MEDIA_PATH}/${e.path}`,
    title: e.title,
    startTime: e.start,
    stopTime: e.end,
    length: e.duration,
  };
}