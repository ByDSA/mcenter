import dotenv from "dotenv";
import mongoose from "mongoose";
import { MediaElement } from "../../../m3u/MediaElement";
import { MultimediaLocalResource, MULTIMEDIA_LOCAL_RESOURCE } from "../resource";

export interface Video extends MultimediaLocalResource {
}

export const VideoSchema = new mongoose.Schema(MULTIMEDIA_LOCAL_RESOURCE);

export function videoToMediaElement(e: Video): MediaElement {
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
