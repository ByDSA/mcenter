/* eslint-disable import/prefer-default-export */
import { assertIsDefined } from "#utils/checking";
import { Episode } from "../series";
import { MediaElement } from "./player";

export function episodeToMediaElement(e: Episode): MediaElement {
  const { MEDIA_PATH } = process.env;

  assertIsDefined(MEDIA_PATH);

  const length = calculateLength(e);

  return {
    path: `${MEDIA_PATH}/${e.path}`,
    title: e.title,
    startTime: e.start,
    stopTime: e.end,
    length,
  };
}

function calculateLength(e: Episode): number {
  let length = -1;

  if (e.start !== undefined && e.end !== undefined)
    length = e.end - e.start;
  else if (e.duration !== undefined) {
    if (e.start !== undefined && e.end === undefined)
      length = e.duration - e.start;
    else if (e.start === undefined && e.end !== undefined)
      length = e.end;
    else
      length = e.duration;
  }

  return length;
}