import { treePut } from "#shared/utils/trees";
import { EpisodeFile, SerieFolderTree } from "../file-info/tree";
import { getSeasonEpisodeFromEpisodeId } from "../file-info/tree/idGetter";
import { Model as Episode } from "../models";

export function putModelInSerieFolderTree(episode: Episode, serieFolderTree: SerieFolderTree): SerieFolderTree {
  const {serieId} = episode;
  const {episodeId} = episode;
  const seasonId = getSeasonFromEpisodeId(episodeId) ?? "";
  const episodeFile: EpisodeFile = episodeToEpisodeFile(episode);

  treePut(serieFolderTree, [serieId, seasonId], episodeFile.id, episodeFile.content);

  return serieFolderTree;
}

function getSeasonFromEpisodeId(episodeId: string): string | null {
  const match = episodeId.match(/^(\d+)x/);

  if (match)
    return match[1];

  return null;
}

export function episodeToEpisodeFile(episode: Episode): EpisodeFile {
  const episodeFile: EpisodeFile = {
    id: getSeasonEpisodeFromEpisodeId(episode.episodeId).episode,
    content: {
      episodeId: episode.episodeId,
      filePath: episode.path,
    },
  };

  return episodeFile;
}