import { SerieId } from "#modules/series/serie";
import { CanDurable, Resource } from "#modules/utils/resource";
import { copyOfResource } from "#modules/utils/resource/Resource.entity";

export type EpisodeId = string;

export type EpisodeFullId = {
  id: EpisodeId;
  serieId: SerieId;
};

export default interface Episode
extends
Resource,
CanDurable {
  id: EpisodeId;
  serieId: SerieId;
}

export function compareEpisodeFullId<T extends EpisodeFullId>(a: T, b: T): boolean {
  return a.id === b.id && a.serieId === b.serieId;
}

export function episodeFullIdOf(episode: Episode): EpisodeFullId {
  return {
    id: episode.id,
    serieId: episode.serieId,
  };
}

export function copyOfEpisode(e: Episode): Episode {
  return {
    ...copyOfResource(e),
    serieId: e.serieId,
  };
}