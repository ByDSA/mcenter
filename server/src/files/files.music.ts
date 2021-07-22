import { loadEnv } from "../env";
import { findFiles } from "./files.find";

loadEnv();

export const AUDIO_EXTENSIONS = ["mp3", "flac", "wma"];

// eslint-disable-next-line import/prefer-default-export
export function findAllValidMusicFiles() {
  const { MUSIC_PATH } = process.env;

  return findFiles( {
    folder: <string>MUSIC_PATH,
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
  const MUSIC_PATH = <string>process.env.MUSIC_PATH;
  const index = fullPath.indexOf(MUSIC_PATH);

  if (index < 0)
    return null;

  return fullPath.substr(index + MUSIC_PATH.length + 1);
}
