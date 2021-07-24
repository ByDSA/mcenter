/* eslint-disable import/prefer-default-export */
import dotenv from "dotenv";
import { calcHashFromFile } from "../../../files";
import { FileNode, getSerieTreeRemote } from "../../../routes/series/nginxTree";
import { Video, VideoInterface } from "../video";
import Doc from "./document";
import Model from "./model";

dotenv.config();

const { SERIES_PATH } = process.env;

export async function generateFromFiles(id: string): Promise<Doc | null> {
  const folder = `${SERIES_PATH}/${id}`;
  const episodes: VideoInterface[] | null = await getSerieTree(folder);

  if (!episodes)
    return null;

  return Model.create( {
    id,
    name: id,
    episodes,
  } ).then((serie) => serie.save());
}

async function getSerieTree(uri: string): Promise<VideoInterface[] | null> {
  if (uri.startsWith("http")) {
    const nginxTree = await getSerieTreeRemote(uri, {
      maxLevel: 2,
    } );

    if (!nginxTree)
      return null;

    return getEpisodesFromTree(nginxTree);
  }

  return getSerieTreeLocal(uri);
}

async function getEpisodesFromTree(tree: FileNode[], episodes: VideoInterface[] = []): Promise<VideoInterface[]> {
  for (const fn of tree) {
    if (fn.type !== "[VID]" && fn.type !== "[DIR]")
      continue;

    if (fn.type !== "[DIR]") {
      const episode = await fileNode2Episode(fn);

      episodes.push(episode);
    }

    const { children } = fn;

    if (children)
      await getEpisodesFromTree(children, episodes);
  }

  return episodes;
}

async function fileNode2Episode(fn: FileNode): Promise<VideoInterface> {
  const path = getPathFromFn(fn);
  const id = getIdFromFn(fn);
  const hash = calcHashFromFile(path);

  return {
    url: id,
    hash,
    path,
    name: "",
    weight: 0,
    start: -1,
    end: -1,
  };
}

function getIdFromFn(fn: FileNode): string {
  const season = fn.relativeUri.substr(0, fn.relativeUri.lastIndexOf("/")).split("/");
  const nameWithoutExt = fn.name.substr(0, fn.name.lastIndexOf("."));
  let id = season.join("x");

  if (season.length > 0 && season[0] !== undefined)
    id += "x";

  if (Number.isNaN(+nameWithoutExt))
    id += nameWithoutExt.padStart(2, "0");
  else
    id += nameWithoutExt;

  return id;
}

function getPathFromFn(fn: FileNode): string {
  const serieUrl = fn.uri.substr(0, fn.uri.indexOf(fn.relativeUri) - 1);
  const serieId = serieUrl.split("/").pop();

  return `series/${serieId}/${fn.relativeUri}`;
}

async function getSerieTreeLocal(path: string): Promise<Video[]> {
  // fs.readdirSync(folder);
  return [];
}
