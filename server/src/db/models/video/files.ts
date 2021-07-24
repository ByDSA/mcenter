import path from "path";
import { loadEnv } from "../../../env";
import { calcHashFromFile } from "../../../files";

export function calcHashFile(relativePath: string) {
  const fullPath = getFullPath(relativePath);
  const hash = calcHashFromFile(fullPath);

  return hash;
}

export function getFullPath(relativePath: string): string {
  loadEnv();
  const VIDEOS_PATH = <string>process.env.VIDEOS_PATH;

  return path.join(VIDEOS_PATH, relativePath);
}
