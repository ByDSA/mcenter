/* eslint-disable import/prefer-default-export */
import { SerieId } from "#modules/series/serie";
import { EpisodeDB } from "../../db";
import Episode from "./Episode";

export function episodeToEpisodeDB(episode: Episode): EpisodeDB {
  const objRequired: Required<EpisodeDB> = {
    id: episode.id,
    path: episode.path,
    end: episode.end,
    start: episode.start,
    lastTimePlayed: episode.lastTimePlayed!,
    tags: episode.tags!,
    duration: episode.duration!,
    title: episode.title!,
    disabled: episode.disabled!,
    weight: episode.weight,
  };
  const ret: EpisodeDB = objRequired;

  return ret;
}

export function episodeDBToEpisode(episodeDB: EpisodeDB, serieId: SerieId): Episode {
  return {
    id: episodeDB.id,
    serieId,
    duration: episodeDB.duration ?? -1,
    start: episodeDB.start ?? -1,
    end: episodeDB.end ?? -1,
    title: episodeDB.title ?? "",
    weight: episodeDB.weight ?? 0,
    path: episodeDB.path,
  };
}