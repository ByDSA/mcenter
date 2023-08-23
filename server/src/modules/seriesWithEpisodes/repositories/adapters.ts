import { Episode } from "#modules/episodes";
import { EpisodeDocODM, episodeDBToEpisode, episodeToEpisodeDB } from "#modules/episodes/repositories";
import SerieWithEpisodes from "../models/SerieWithEpisodes";
import { DocODM } from "./serie.model";

/* eslint-disable import/prefer-default-export */
export function serieWithEpisodesDBToSerieWithEpisodes(serieDB: DocODM): SerieWithEpisodes {
  return {
    id: serieDB.id,
    name: serieDB.name,
    episodes: serieDB.episodes.map((episodeDB: EpisodeDocODM): Episode => episodeDBToEpisode(episodeDB, serieDB.id)),
  };
}

export function serieWithEpisodesToSerieWithEpisodesDB(serieWithEpisodes: SerieWithEpisodes): DocODM {
  return {
    id: serieWithEpisodes.id,
    name: serieWithEpisodes.id,
    episodes: serieWithEpisodes.episodes.map(episodeToEpisodeDB),
  };
}