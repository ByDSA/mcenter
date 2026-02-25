import path from "node:path";
import { ENVS } from "#musics/utils";

export const MOVIES_MEDIA_PATH = path.join(ENVS.mediaPath, "movies");

export function getAbsolutePath(relativePath: string = ""): string {
  let mediaPath = MOVIES_MEDIA_PATH;

  if (!mediaPath.startsWith("/"))
    mediaPath = path.join(process.cwd(), mediaPath);

  return path.join(mediaPath, relativePath);
}
