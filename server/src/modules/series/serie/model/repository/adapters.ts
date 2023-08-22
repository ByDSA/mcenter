import { Episode } from "#modules/series/episode";
import { EpisodeDB } from "#modules/series/episode/db";
import { episodeDBToEpisode, episodeToEpisodeDB } from "#modules/series/episode/model/repository/adapters";
import SerieWithEpisodes from "./SerieWithEpisodes";
import { SerieDB } from "./serie.model";

/* eslint-disable import/prefer-default-export */
export function serieDBToSerieWithEpisodes(serieDB: SerieDB): SerieWithEpisodes {
  return {
    id: serieDB.id,
    name: serieDB.name,
    episodes: serieDB.episodes.map((episodeDB: EpisodeDB): Episode => episodeDBToEpisode(episodeDB, serieDB.id)),
  };
}

export function serieWithEpisodesToSerieDB(serieWithEpisodes: SerieWithEpisodes): SerieDB {
  return {
    id: serieWithEpisodes.id,
    name: serieWithEpisodes.id,
    episodes: serieWithEpisodes.episodes.map(episodeToEpisodeDB),
  };
}