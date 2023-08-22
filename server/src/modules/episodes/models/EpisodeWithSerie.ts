import { Serie } from "#modules/series";
import Episode from "./Episode";

export default interface EpisodeWithSerie
extends Episode {
  serie: Serie | null;
}
