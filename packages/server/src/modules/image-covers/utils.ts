import path from "node:path";
import { ENVS } from "#musics/utils";
import { isTest } from "#utils";

export const IMAGE_COVERS_FOLDER = "image-covers";

export const IMAGE_COVERS_FOLDER_PATH = path.join(
  isTest() ? process.cwd() : "",
  ENVS.mediaPath,
  IMAGE_COVERS_FOLDER,
);
