import { EpisodeId } from "#episodes/models";

export function stringifyEpisodeId(episodeId: EpisodeId): string {
  return `(${episodeId.serieId}; ${episodeId.code})`;
}
