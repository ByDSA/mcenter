import { Episode } from "#modules/episodes";
import { EpisodeDB, episodeDBToEpisode, episodeToEpisodeDB } from "#modules/episodes/repositories";
import SerieWithEpisodes from "../models/SerieWithEpisodes";
import { DocumentODM } from "./serie.model";

/* eslint-disable import/prefer-default-export */
export function serieDBToSerieWithEpisodes(serieDB: DocumentODM): SerieWithEpisodes {
  return {
    id: serieDB.id,
    name: serieDB.name,
    episodes: serieDB.episodes.map((episodeDB: EpisodeDB): Episode => episodeDBToEpisode(episodeDB, serieDB.id)),
  };
}

export function serieWithEpisodesToSerieDB(serieWithEpisodes: SerieWithEpisodes): DocumentODM {
  return {
    id: serieWithEpisodes.id,
    name: serieWithEpisodes.id,
    episodes: serieWithEpisodes.episodes.map(episodeToEpisodeDB),
  };
}