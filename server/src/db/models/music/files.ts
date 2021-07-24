import path from "path";
import { loadEnv } from "../../../env";
import { calcHashFromFile } from "../../../files";
import { findFiles } from "../../../files/files.find";

loadEnv();

export const AUDIO_EXTENSIONS = ["mp3", "flac", "wma"];

// eslint-disable-next-line import/prefer-default-export
export function findAllValidMusicFiles() {
  const { MUSICS_PATH } = process.env;

  return findFiles( {
    folder: <string>MUSICS_PATH,
    recursive: true,
    extensions: AUDIO_EXTENSIONS,
  } ).map((fullPath) => {
    const ret = getRelativePath(fullPath);

    if (!ret)
      throw new Error();

    return ret;
  } );
}

function getRelativePath(fullPath: string): string | null {
  const MUSICS_PATH = <string>process.env.MUSICS_PATH;
  const index = fullPath.indexOf(MUSICS_PATH);

  if (index < 0)
    return null;

  return fullPath.substr(index + MUSICS_PATH.length + 1);
}

export function getFullPath(relativePath: string): string {
  loadEnv();
  const MUSICS_PATH = <string>process.env.MUSICS_PATH;

  return path.join(MUSICS_PATH, relativePath);
}

export function calcHashFile(relativePath: string) {
  const fullPath = getFullPath(relativePath);
  const hash = calcHashFromFile(fullPath);

  return hash;
}
