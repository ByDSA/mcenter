import path from "path";
import { ENVS } from "#musics/utils";

export function getAbsolutePath(relativePath: string = ""): string {
  // TODO: quitar "series/" del path en DB
  relativePath = relativePath.replace(/^series\//, "");
  let mediaPath = path.join(ENVS.mediaPath, "series");

  if (!mediaPath.startsWith("/"))
    mediaPath = path.join(process.cwd(), mediaPath);

  return path.join(mediaPath, relativePath);
}
