import { Serie } from "#modules/series/serie";
import Episode from "./repository/Episode";

export default interface EpisodeWithSerie
extends Episode {
  serie: Serie | null;
}
