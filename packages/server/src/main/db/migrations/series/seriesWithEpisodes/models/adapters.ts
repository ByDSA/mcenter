/* eslint-disable import/prefer-default-export */
import { Serie } from "#modules/series";
import SerieWithEpisodes from "./SerieWithEpisodes";

export function serieWithEpisodesToSerie(serieWithEpisodes: SerieWithEpisodes): Serie {
  const serie: Serie = {
    id: serieWithEpisodes.id,
    name: serieWithEpisodes.name,
  };

  return serie;
}