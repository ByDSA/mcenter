/* eslint-disable import/prefer-default-export */
import dotenv from "dotenv";
import { FileNode, getSerieTreeRemote } from "../../../routes/series/nginxTree";
import { Group } from "../group";
import GroupModel from "../group/model";
import { Video } from "../video";

dotenv.config();

const { MEDIA_PATH } = process.env;

export async function generateFromFiles(id: string): Promise<Group | null> {
  const folder = `${MEDIA_PATH}/series/${id}`;
  const episodes: Video[] | null = await getSerieTree(folder);

  if (!episodes)
    return null;

  return GroupModel.create( {
    id,
    name: id,
    episodes,
  } ).then((serie) => serie.save());
}

async function getSerieTree(uri: string): Promise<Video[] | null> {
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

async function getEpisodesFromTree(tree: FileNode[], episodes: Video[] = []): Promise<Video[]> {
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

async function fileNode2Episode(fn: FileNode): Promise<Video> {
  const path = getPathFromFn(fn);
  const id = getIdFromFn(fn);

  return {
    id,
    path,
    title: "",
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
