import type { EpisodeEntityWithFileInfo } from "./SavedSerieTreeService";
import { treePut } from "$shared/utils/trees";
import { EpisodeFile, SerieFolderTree, getSeasonEpisodeFromEpisodeId } from "#episodes/file-info";

export function putModelInSerieFolderTree(
  episodeEntity: EpisodeEntityWithFileInfo,
  serieFolderTree: SerieFolderTree,
): SerieFolderTree {
  const { compKey: { seriesKey, episodeKey } } = episodeEntity;
  const seasonId = getSeasonFromCode(episodeKey) ?? "";
  const episodeFiles: EpisodeFile[] = episodeToEpisodeFiles(episodeEntity);

  for (const episodeFile of episodeFiles)
    treePut(serieFolderTree, [seriesKey, seasonId], episodeFile.id, episodeFile.content);

  return serieFolderTree;
}

function getSeasonFromCode(code: string): string | null {
  const match = code.match(/^(\d+)x/);

  if (match)
    return match[1];

  return null;
}

export function episodeToEpisodeFiles(
  episode: Pick<EpisodeEntityWithFileInfo, "compKey" | "fileInfos">,
): EpisodeFile[] {
  const id = getSeasonEpisodeFromEpisodeId(episode.compKey.episodeKey).episode;
  const episodeId = episode.compKey.episodeKey;
  const episodeFiles: EpisodeFile[] = episode.fileInfos.map(f =>( {
    id,
    content: {
      episodeId,
      filePath: f.path,
    },
  } ));

  return episodeFiles;
}
