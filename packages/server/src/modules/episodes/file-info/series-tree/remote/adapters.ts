import type { EpisodeEntityWithFileInfos } from "./service";
import { EpisodeFile, getSeasonEpisodeFromEpisodeId } from "#episodes/file-info";

export function episodeToEpisodeFiles(
  episode: EpisodeEntityWithFileInfos,
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
