import { MusicTypeStr, ResourceType, VideoTypeStr } from "../types";
import { LocalResourceInterface, MultimediaLocalResourceInterface, ResourceInterface } from "./interface";
import { check, checkLocal, checkLocalFile } from "./testing";

export {
  ResourceInterface,
  LocalResourceInterface,
  MultimediaLocalResourceInterface,
  check as checkResource,
  checkLocal as checkLocalResource,
  checkLocalFile as checkLocalFileResource,
  ResourceType,
  MusicTypeStr as MUSIC_TYPE_STR,
  VideoTypeStr as VIDEO_TYPE_STR,
};
