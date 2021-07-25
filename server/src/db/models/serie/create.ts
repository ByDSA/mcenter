/* eslint-disable import/prefer-default-export */
import path from "path";
import { calcHashFromFile } from "../../../files";
import { getValidUrl, removeExtension } from "../../../files/misc";
import { VideoInterface } from "../video";
import Doc from "./document";
import { findFilesNotRecursivelyAt, getFoldersIn, getFullPath } from "./files";
import Model from "./model";

export async function createFromPath(relativePath: string): Promise<Doc|null> {
  const seasons = getFoldersIn(relativePath);

  if (!seasons || seasons.length === 0)
    return null;

  const serieRelativePathsEpisodes = [];

  for (const season of seasons) {
    const relativePathSeason = path.join(relativePath, season);
    // eslint-disable-next-line no-await-in-loop
    let files = await findFilesNotRecursivelyAt(relativePathSeason);

    files = files.map((f) => f.substr(f.indexOf(relativePath) + relativePath.length + 1));

    serieRelativePathsEpisodes.push(...files);
  }

  const episodes: VideoInterface[] = serieRelativePathsEpisodes.map((serieRelativePath) => {
    const url = getEpisodeValidUrl(serieRelativePath);
    const name = getNameFromPath(serieRelativePath);
    const relativePathEpisode = path.join(relativePath, serieRelativePath);
    const fullPath = getFullPath(relativePathEpisode);
    const hash = calcHashFromFile(fullPath);

    return {
      path: serieRelativePath,
      url,
      name,
      hash,
    };
  } );
  const serie = new Model( {
    path: relativePath,
    name: relativePath,
    url: getValidUrl(relativePath),
    episodes,
  } );

  return serie;
}

function getEpisodeValidUrl(relativeFilePath: string): string {
  const season = relativeFilePath.substr(0, relativeFilePath.indexOf("/"));
  const fileName = getNameFromPath(relativeFilePath).padStart(2, "0");

  return `${season}x${fileName}`;
}

function getNameFromPath(relativeFilePath: string) {
  const basename = path.basename(relativeFilePath);

  return removeExtension(basename);
}
