import { Episode } from "#modules/series/episode";

export type SerieId = string;

export interface SerieWithoutEpisodes {
  id: SerieId;
  name: string;
}

export default interface Serie extends SerieWithoutEpisodes {
  episodes: Episode[];
}
