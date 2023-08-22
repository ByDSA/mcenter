import { Episode } from "#modules/series/episode";
import Serie from "../Serie";

export default interface SerieWithEpisodes extends Serie {
  episodes: Episode[];
}