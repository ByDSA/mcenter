import { SerieId } from "#modules/series/serie";
import { CanDurable, Resource } from "#modules/utils/resource";
import { copyOfResource } from "#modules/utils/resource/Resource.entity";

export type EpisodeId = string;

export type EpisodeFullId = {
  episodeId: EpisodeId;
  serieId: SerieId;
};

export default interface Episode
extends
Resource,
CanDurable, EpisodeFullId {
}

export function compareEpisodeFullId(a: EpisodeFullId, b: EpisodeFullId): boolean {
  return a.episodeId === b.episodeId && a.serieId === b.serieId;
}

export function episodeFullIdOf(episode: Episode): EpisodeFullId {
  return {
    episodeId: episode.episodeId,
    serieId: episode.serieId,
  };
}

export function copyOfEpisode(e: Episode): Episode {
  return {
    ...copyOfResource(e),
    episodeId: e.episodeId,
    serieId: e.serieId,
  };
}