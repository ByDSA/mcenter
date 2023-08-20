/* eslint-disable import/prefer-default-export */
import dotenv from "dotenv";
import { Episode } from "../series";
import { assertIsDefined } from "../utils/built-in-types/errors";
import { MediaElement } from "./player";

export function episodeToMediaElement(e: Episode): MediaElement {
  dotenv.config();
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