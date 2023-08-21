import { Serie, SerieId } from "#modules/series/serie";
import { CanDurable, Resource } from "#modules/utils/resource";
import { copyOfResource } from "#modules/utils/resource/Resource.entity";

export type EpisodeInnerId = string;

export type EpisodeId = {
  innerId: EpisodeInnerId;
  serieId: SerieId;
};

export function compareEpisodeId(a: EpisodeId, b: EpisodeId): boolean {
  return a.innerId === b.innerId; // TODO: && a.serieId === b.serieId;
}

export interface Episode
extends
Resource,
CanDurable {
  id: EpisodeId;
}

export default interface EpisodeWithSerie
extends Episode {
  serie: Serie;
}

export function copyOfEpisode(e: Episode): Episode {
  return {
    ...copyOfResource(e),
    id: e.id,
  };
}