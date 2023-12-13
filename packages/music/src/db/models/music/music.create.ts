import NodeID3 from "node-id3";
import path from "path";
import { getFullPath } from "../../../env";
import { calcHashFromFile } from "../../../files";
import { AUDIO_EXTENSIONS } from "../../../files/files.music";
import { download } from "../../../youtube";
import Music from "./music.document";
import { findByPath } from "./music.find";
import MusicModel from "./music.model";

export function createFromPath(relativePath: string): Promise<Music> {
  const fullPath = getFullPath(relativePath);
  const tags = NodeID3.read(fullPath);
  const title = tags.title || getTitleFromFilename(fullPath);
  let baseName = path.basename(fullPath);

  baseName = baseName.substr(0, baseName.lastIndexOf("."));
  const url = getUrl(baseName);
  const hash = calcHashFromFile(fullPath);

  return MusicModel.create( {
    hash,
    path: relativePath,
    title,
    artist: tags.artist,
    album: tags.album,
    addedAt: Date.now(),
    url,
  } );
}

export function createFromPathAndSave(relativePath: string): Promise<Music> {
  return createFromPath(relativePath)
    .then((music) => music.save());
}

function getTitleFromFilename(relativePath: string): string {
  const title = path.basename(relativePath);

  return removeExtension(title);
}

function removeExtension(str: string): string {
  for (const ext of AUDIO_EXTENSIONS) {
    const index = str.lastIndexOf(`.${ext}`);

    if (index >= 0)
      return str.substr(0, index);
  }

  return str;
}

function getUrl(title: string) {
  const uri = title
    .toLowerCase()
    .replace(/(-\s-)|(\s-)|(-\s)/g, "-")
    .replace(/\s/g, "_")
    .replace(/&|\?|\[|\]|:|'|"/g, "");

  return uri;
}

export async function findOrCreateAndSaveFromPath(relativePath: string): Promise<Music> {
  const read = await findByPath(relativePath);

  if (read)
    return read;

  return createFromPathAndSave(relativePath);
}

export async function findOrCreateAndSaveFromYoutube(strId: string): Promise<Music> {
  const data = await download(strId);

  return findOrCreateAndSaveFromPath(data.file);
}
