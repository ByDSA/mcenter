import fs, { Dirent } from "node:fs";
import path from "node:path";
import { GetEpisodeIdOptions, getEpisodeSeasonAndEpisodeNumberFromFilePath, getSeasonEpisodeFromEpisodeId } from "./idGetter";
import { EpisodeNode, SeasonNode, SerieNode, SerieTree } from "./models";

type Options = {
  baseFolder?: string;
};

export function findAllSerieFolderTreesAt(
  folderFullPath: string,
  options?: Options,
): SerieTree {
  const baseFolder = options?.baseFolder ?? "";
  const seriesNames = readFolderNamesIn(folderFullPath);
  const series: SerieNode[] = [];

  seriesNames.forEach(serieFolderName => {
    const serieFolderFullPath = path.join(folderFullPath, serieFolderName);
    const seasonsNames: SeasonNode["id"][] = readFolderNamesIn(serieFolderFullPath);

    seasonsNames.push("");
    const seasonsInSerie: SeasonNode[] = [];
    const episodesInSerie: EpisodeNode[] = [];

    for (const seasonFolderName of seasonsNames) {
      const seasonFolderPath = path.join(serieFolderFullPath, seasonFolderName?.toString() ?? "");
      const episodesDirents = readEpisodeFilesIn(seasonFolderPath);

      for (const episodeFile of episodesDirents) {
        const fileFullPath = path.join(seasonFolderPath, episodeFile.name);
        const seasonEpisodeId = getSeasonEpisodeId(fileFullPath, {
          serieFolder: serieFolderFullPath,
        } );

        if (seasonEpisodeId === null || seasonEpisodeId.id === null)

          continue;

        const { id: episodeId, season: seasonId } = seasonEpisodeId;
        const filePath = baseFolder
          + fileFullPath.substring(folderFullPath.length + 1);
        const episode: EpisodeNode = {
          content: {
            episodeId,
            filePath,
          },
          id: getSeasonEpisodeFromEpisodeId(episodeId).episode,
        };

        episodesInSerie.push(episode);
        let seasonObj = seasonsInSerie.find(s => s.id === seasonId);

        if (!seasonObj) {
          seasonObj = {
            id: seasonId,
            children: [],
          };
          seasonsInSerie.push(seasonObj);
        }

        seasonObj.children.push(episode);
      }
    }

    checkDuplicatedEpisodeId(episodesInSerie);

    const serie: SerieNode = {
      id: serieFolderName,
      children: seasonsInSerie,
    };

    series.push(serie);
  } );

  return {
    children: series,
  };
}

function isValidEpisodeDirent(dirent: Dirent): boolean {
  if (!dirent.isFile())
    return false;

  const { name } = dirent;

  if (name.startsWith("."))
    return false;

  const ext = path.extname(name);

  return ext === ".mp4" || ext === ".mkv" || ext === ".avi" || ext === ".wmv" || ext === ".flv"
    || ext === ".mov";
}

function readFolderNamesIn(folderFullPath: string): string[] {
  const folderContent = fs.readdirSync(folderFullPath, {
    withFileTypes: true,
  } );
  const folders = folderContent.filter(
    folder => folder.isDirectory() && !folder.name.startsWith("."),
  );
  const foldersPaths = folders.map(serie => serie.name);

  return foldersPaths;
}

function readEpisodeFilesIn(folderFullPath: string): Dirent[] {
  return fs.readdirSync(folderFullPath, {
    withFileTypes: true,
  } ).filter(isValidEpisodeDirent);
}

type EpisodeIdRet = {
  id: string ;
  season: SeasonNode["id"];
};
function getSeasonEpisodeId(filePath: string, options: GetEpisodeIdOptions): EpisodeIdRet | null {
  const seasonEpisode = getEpisodeSeasonAndEpisodeNumberFromFilePath(filePath, options);

  if (seasonEpisode === null)
    return null;

  const { season, episode: episodeNumber } = seasonEpisode;

  if (episodeNumber === null)
    return null;

  const episodeStr = episodeNumber.toString().padStart(2, "0");

  if (season === null) {
    return {
      id: episodeStr,
      season: "",
    };
  }

  return {
    id: `${season}x${episodeStr}`,
    season,
  };
}

type Ret = {[key: string]: EpisodeNode[]};
function checkDuplicatedEpisodeId(episodes: EpisodeNode[]): void {
  const duplicatedEpisodes: Ret = {};
  const duplicatedIds: string[] = [];

  for (let i = 0; i < episodes.length; i++) {
    const episode = episodes[i];
    const { episodeId } = episode.content;

    if (!duplicatedIds.includes(episodeId)) {
      for (let j = i + 1; j < episodes.length; j++) {
        const otherEpisode = episodes[j];

        if (episodeId === otherEpisode.content.episodeId) {
          duplicatedEpisodes[episodeId] = [episode];
          duplicatedIds.push(episodeId);
          break;
        }
      }
    } else
      duplicatedEpisodes[episodeId].push(episode);
  }

  if (Object.entries(duplicatedEpisodes).length > 0) {
    let message = "Duplicated episodes: ";

    message += JSON.stringify(
      Object.entries(duplicatedEpisodes).reduce((acc, [episodeId, eps]) => {
        acc[episodeId] = eps.map(episode => episode.content.filePath);

        return acc;
      }, {} as {[key: string]: string[]} ),
      null,
      2,
    );
    const e = new Error(message);

    e.name = "DuplicatedEpisodeId";

    throw e;
  }
}
