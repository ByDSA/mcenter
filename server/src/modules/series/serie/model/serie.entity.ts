import { Episode } from "#modules/series/episode";

export type SerieId = string;

export default interface Serie {
  id: SerieId;
  name: string;
  episodes: Episode[];
}