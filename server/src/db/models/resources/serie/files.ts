import { loadEnv } from "@app/env";
import fs from "fs";
import { generateCommonFilesFunctions } from "../genFuncs";
import { VIDEO_EXTENSIONS } from "../video/files";

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
