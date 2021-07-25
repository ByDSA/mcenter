import NodeID3 from "node-id3";
import path from "path";
import { calcHashFromFile, getValidUrl } from "../../../files";
import { getTitleFromFilename } from "../../../files/misc";
import { download } from "../../../music/youtube";
import Doc from "./document";
import { getFullPath } from "./files";
import { findByPath } from "./find";
import Model from "./model";

export function createFromPath(relativePath: string): Promise<Doc|null> {
  const fullPath = getFullPath(relativePath);
  const tags = NodeID3.read(fullPath);
  const title = tags.title || getTitleFromFilename(fullPath);
  let baseName = path.basename(fullPath);

  baseName = baseName.substr(0, baseName.lastIndexOf("."));
  const url = getValidUrl(baseName);
  const hash = calcHashFromFile(fullPath);

  return Model.create( {
    hash,
    path: relativePath,
    name: title,
    artist: tags.artist,
    album: tags.album,
    url,
  } );
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
