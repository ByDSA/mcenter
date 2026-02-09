import path from "node:path";
import { ENVS } from "#musics/utils";
import { isTest } from "#utils";

export const EPISODES_MEDIA_PATH = path.join(
  isTest() ? process.cwd() : "",
  ENVS.mediaPath,
  "series",
);

export function getAbsolutePath(relativePath: string = ""): string {
  return path.join(EPISODES_MEDIA_PATH, relativePath);
}
