import path from "node:path";
import { ENVS } from "#musics/utils";
import { isTest } from "#utils";

export const EPISODES_MEDIA_PATH = path.join(
  isTest() ? process.cwd() : "",
  ENVS.mediaPath,
  "series",
);

export const EPISODES_MEDIA_UPLOAD_FOLDER_PATH = path.join(EPISODES_MEDIA_PATH, ".upload");
