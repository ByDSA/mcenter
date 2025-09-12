import type { EpisodeEntityWithFileInfos } from "./service";
import { EpisodeFile, getSeasonEpisodeFromEpisodeId } from "../disk";

export function episodeToEpisodeFiles(
  episode: EpisodeEntityWithFileInfos,
): EpisodeFile[] {
  const key = getSeasonEpisodeFromEpisodeId(episode.compKey.episodeKey).episode;
  const { episodeKey } = episode.compKey;
  const episodeFiles: EpisodeFile[] = episode.fileInfos.map(f =>( {
    key,
    content: {
      episodeKey,
      filePath: f.path,
    },
  } ));

  return episodeFiles;
}
