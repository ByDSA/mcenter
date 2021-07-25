import dotenv from "dotenv";
import { MediaElement } from "../../../m3u/MediaElement";
import { createFromPath } from "./create";
import { deleteAll } from "./delete";
import Document from "./document";
import { calcHashFile, findFiles, findFilesAt, getFullPath } from "./files";
import { findByHash, findByPath, findByUrl } from "./find";
import Interface from "./interface";
import Model from "./model";
import Schema from "./schema";

function toMediaElement(e: Interface): MediaElement {
  dotenv.config();
  const { VIDEOS_PATH } = process.env;

  return {
    path: `${VIDEOS_PATH}/${e.path}`,
    title: e.name,
    startTime: e.start,
    stopTime: e.end,
    length: e.duration,
  };
}

export {
  Document as Video,
  Model as VideoModel,
  Interface as VideoInterface,
  Schema as VideoSchema,
  findByUrl as findVideoByUrl,
  findByPath as findVideoByPath,
  findByHash as findVideoByHash,
  toMediaElement as videoToMediaElement,
  deleteAll as deleteAllVideos,
  createFromPath as createVideoFromPath,
  getFullPath as getVideoFullPath,
  calcHashFile as calcVideoHashFile,
  findFiles as findVideoFiles,
  findFilesAt as findVideoFilesAt,
};
