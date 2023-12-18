import { ENVS } from "../env";
import { findFiles } from "./files.find";

export const AUDIO_EXTENSIONS = ["mp3", "flac"];

// eslint-disable-next-line import/prefer-default-export
export async function findAllValidMusicFiles() {
  return (await findFiles( {
    folder: ENVS.mediaPath,
    recursive: true,
    extensions: AUDIO_EXTENSIONS,
  } )).map((fullPath) => {
    const ret = getRelativePath(fullPath);

    if (!ret)
      throw new Error();

    return ret;
  } );
}

function getRelativePath(fullPath: string): string | null {
  const {mediaPath} = ENVS;
  const index = fullPath.indexOf(mediaPath);

  if (index < 0)
    return null;

  return fullPath.substr(index + mediaPath.length + 1);
}
