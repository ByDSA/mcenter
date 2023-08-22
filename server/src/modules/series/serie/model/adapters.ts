/* eslint-disable import/prefer-default-export */
import Serie from "./Serie";
import SerieWithEpisodes from "./repository/SerieWithEpisodes";

export function serieWithEpisodesToSerie(serieWithEpisodes: SerieWithEpisodes): Serie {
  const serie: Serie = {
    id: serieWithEpisodes.id,
    name: serieWithEpisodes.name,
  };

  return serie;
}