/* eslint-disable import/prefer-default-export */
import { calcHashFromFile, getTitleFromFilename, getValidUrl } from "@app/files";
import NodeID3 from "node-id3";
import path from "path";
import Doc from "./document";
import { getFullPath } from "./files";
import Model from "./model";

export async function createFromPath(relativePath: string): Promise<Doc | null> {
  const fullPath = getFullPath(relativePath);
  const tags = NodeID3.read(fullPath);
  const title = tags.title || getTitleFromFilename(fullPath);
  let baseName = path.basename(fullPath);

  baseName = baseName.substr(0, baseName.lastIndexOf("."));
  const url = getValidUrl(baseName);
  const hash = calcHashFromFile(fullPath);
  const videoObj = {
    hash,
    path: relativePath,
    title,
    artist: tags.artist,
    album: tags.album,
    url,
  };
  const video = await Model.create(videoObj);

  return video;
}
