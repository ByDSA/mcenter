import { loadEnv } from "@actions/utils/env";
import fs from "fs";
import { generateCommonFilesFunctions } from "../genFuncs";
import { VIDEO_EXTENSIONS } from "../video/files";
import Interface, { Episode } from "./interface";

const basePath = <string>process.env.SERIES_PATH;

loadEnv();

export function findSeries() {
// TODO: this
}

const generatedFunctions = generateCommonFilesFunctions( {
  extensions: VIDEO_EXTENSIONS,
  basePath,
} );

export const { calcHashFile,
  getFullPath,
  getRelativePath,
  findFiles,
  findFilesNotRecursivelyAt,
  findFilesAt } = generatedFunctions;

export function getFoldersIn(relativePath: string) {
  const fullPath = getFullPath(relativePath);

  try {
    return fs.readdirSync(fullPath, {
      withFileTypes: true,
    } )
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch (err) {
    return null;
  }
}

type Params = {
  serie: Interface;
  episode: Episode;
};
export function getEpisodeFullPath( { episode, serie }: Params) {
  const relativeEpisodePath = episode.path;
  const relativeSeriePath = serie.path;

  return `${getFullPath(relativeSeriePath)}/${relativeEpisodePath}`;
}
