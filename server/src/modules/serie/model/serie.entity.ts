import { Episode } from "#modules/episode";

export type SerieId = string;

export default interface Serie {
  id: SerieId;
  name: string;
  episodes: Episode[];
}