import { EpisodeId } from "#modules/episodes";
import { Serie } from "#modules/series";
import { CanDurable, Resource } from "#modules/utils/resource";

export interface EpisodeInSerie extends
Resource,
CanDurable {
id: EpisodeId;
}

export default interface SerieWithEpisodes extends Serie {
  episodes: EpisodeInSerie[];
}