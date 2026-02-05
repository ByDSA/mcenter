import type { EpisodeEntityWithFileInfos } from "./service";
import { splitSeasonEpisodeFromEpisodeKey } from "$shared/models/episodes/episode-code";
import { EpisodeFile } from "../disk";

export function episodeToEpisodeFiles(
  episode: EpisodeEntityWithFileInfos,
): EpisodeFile[] {
  const key = splitSeasonEpisodeFromEpisodeKey(episode.compKey.episodeKey).episode;
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
