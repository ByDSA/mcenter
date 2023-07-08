import { MediaElement } from "#modules/player";
import { CanDurable, Resource } from "#modules/utils/base/resource";
import { copyOfResource } from "#modules/utils/base/resource/Resource.entity";
import dotenv from "dotenv";

export type EpisodeId = string;

export default interface Episode
extends
Resource,
CanDurable {
  id: EpisodeId;
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

export function copyOfEpisode(e: Episode): Episode {
  return {
    ...copyOfResource(e),
  };
}