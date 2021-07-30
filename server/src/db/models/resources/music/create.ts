import { calcHashFromFile, getValidUrl } from "@actions/utils/files";
import { getTitleFromFilename } from "@actions/utils/files/misc";
import { download } from "@app/actions/music/youtube";
import NodeID3 from "node-id3";
import path from "path";
import Doc from "./document";
import { getFullPath } from "./files";
import { findByPath } from "./find";
import Interface from "./interface";
import Model from "./model";

// eslint-disable-next-line require-await
export async function createFromPath(relativePath: string): Promise<Doc|null> {
  const fullPath = getFullPath(relativePath);
  const tags = NodeID3.read(fullPath);
  const title = tags.title || getTitleFromFilename(fullPath);
  let baseName = path.basename(fullPath);

  baseName = baseName.substr(0, baseName.lastIndexOf("."));
  const url = getValidUrl(baseName);
  const hash = calcHashFromFile(fullPath);
  const musicObj: Interface = {
    hash,
    path: relativePath,
    name: title,
    artist: tags.artist,
    album: tags.album,
    url,
  };
  const music = await Model.create(musicObj);

  return music;
}

export async function findOrCreateAndSaveFromPath(relativePath: string): Promise<Doc|null> {
  const read = await findByPath(relativePath);

  if (read)
    return read;

  return createFromPath(relativePath).then((m) => {
    if (m)
      return m.save();

    return null;
  } );
}

export async function findOrCreateAndSaveFromYoutube(strId: string): Promise<Doc|null> {
  const data = await download(strId);

  return findOrCreateAndSaveFromPath(data.file);
}
