/* eslint-disable import/prefer-default-export */
import { assertIsDefined } from "#utils/checking";
import { Episode } from "../series";
import { MediaElement } from "./player";

export function episodeToMediaElement(e: Episode): MediaElement {
  const { MEDIA_PATH } = process.env;

  assertIsDefined(MEDIA_PATH);

  return {
    path: `${MEDIA_PATH}/${e.path}`,
    title: e.title,
    startTime: e.start,
    stopTime: e.end,
    length: e.duration,
  };
}