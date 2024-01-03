import { EpisodeFile, SerieFolderTree } from "#modules/episodes/file-info/tree";
import { getSeasonEpisodeFromEpisodeId } from "#modules/episodes/file-info/tree/idGetter";
import { Model as Episode } from "#modules/episodes/models";
import { treePut } from "#shared/utils/trees";

export function putModelInSerieFolderTree(episode: Episode, serieFolderTree: SerieFolderTree): SerieFolderTree {
  const {id: {serieId, innerId}} = episode;
  const seasonId = getSeasonFromInnerId(innerId) ?? "";
  const episodeFile: EpisodeFile = episodeToEpisodeFile(episode);

  treePut(serieFolderTree, [serieId, seasonId], episodeFile.id, episodeFile.content);

  return serieFolderTree;
}

function getSeasonFromInnerId(innerId: string): string | null {
  const match = innerId.match(/^(\d+)x/);

  if (match)
    return match[1];

  return null;
}

export function episodeToEpisodeFile(episode: Episode): EpisodeFile {
  const episodeFile: EpisodeFile = {
    id: getSeasonEpisodeFromEpisodeId(episode.id.innerId).episode,
    content: {
      episodeId: episode.id.innerId,
      filePath: episode.path,
    },
  };

  return episodeFile;
}