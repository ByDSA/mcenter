import { Serie } from "#modules/series/serie";
import { CanDurable, Resource } from "#modules/utils/base/resource";
import { copyOfResource } from "#modules/utils/base/resource/Resource.entity";

export type EpisodeId = string;

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
  };
}