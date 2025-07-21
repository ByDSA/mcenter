import { EpisodeCompKey } from "#episodes/models";

export function stringifyEpisodeCompKey(episodeCompKey: EpisodeCompKey): string {
  return `(${episodeCompKey.seriesKey}; ${episodeCompKey.episodeKey})`;
}
