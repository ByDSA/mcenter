import { loadEnv } from "../env";
import { findFiles } from "./files.find";

loadEnv();

export const AUDIO_EXTENSIONS = ["mp3", "flac"];

// eslint-disable-next-line import/prefer-default-export
export function findAllValidMusicFiles() {
  const { MEDIA_PATH } = process.env;

  return findFiles( {
    folder: <string>MEDIA_PATH,
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
  const MEDIA_PATH = <string>process.env.MEDIA_PATH;
  const index = fullPath.indexOf(MEDIA_PATH);

  if (index < 0)
    return null;

  return fullPath.substr(index + MEDIA_PATH.length + 1);
}
