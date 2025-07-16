import { treePut } from "$shared/utils/trees";
import { EpisodeEntity } from "#episodes/models";
import { EpisodeFile, SerieFolderTree, getSeasonEpisodeFromEpisodeId } from "#episodes/file-info";

export function putModelInSerieFolderTree(
  episode: EpisodeEntity,
  serieFolderTree: SerieFolderTree,
): SerieFolderTree {
  const { id: { serieId, code } } = episode;
  const seasonId = getSeasonFromCode(code) ?? "";
  const episodeFile: EpisodeFile = episodeToEpisodeFile(episode);

  treePut(serieFolderTree, [serieId, seasonId], episodeFile.id, episodeFile.content);

  return serieFolderTree;
}

function getSeasonFromCode(code: string): string | null {
  const match = code.match(/^(\d+)x/);

  if (match)
    return match[1];

  return null;
}

export function episodeToEpisodeFile(episode: Pick<EpisodeEntity, "id" | "path">): EpisodeFile {
  const episodeFile: EpisodeFile = {
    id: getSeasonEpisodeFromEpisodeId(episode.id.code).episode,
    content: {
      episodeId: episode.id.code,
      filePath: episode.path,
    },
  };

  return episodeFile;
}
