import { Episode } from "#modules/episodes";
import { Serie } from "#modules/series";

export default interface SerieWithEpisodes extends Serie {
  episodes: Episode[];
}