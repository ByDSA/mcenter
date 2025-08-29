import { AUDIO_EXTENSIONS } from "$shared/models/musics/audio-extensions";
import { getAbsolutePath } from "../utils";
import { findFiles } from "./files.find";

export async function findAllValidMusicFiles() {
  return (await findFiles( {
    folder: getAbsolutePath(),
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
  const mediaPath = getAbsolutePath();
  const index = fullPath.indexOf(mediaPath);

  if (index < 0)
    return null;

  return fullPath.substr(index + mediaPath.length + 1);
}
