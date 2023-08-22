/* eslint-disable import/prefer-default-export */
import Model from "../../series/models/Serie";
import SerieWithEpisodes from "./SerieWithEpisodes";

export function serieWithEpisodesToSerie(serieWithEpisodes: SerieWithEpisodes): Model {
  const serie: Model = {
    id: serieWithEpisodes.id,
    name: serieWithEpisodes.name,
  };

  return serie;
}