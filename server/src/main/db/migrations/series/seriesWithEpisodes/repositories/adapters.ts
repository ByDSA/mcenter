import { Episode } from "#modules/episodes";
import { SerieId } from "#modules/series";
import { EpisodeInSerie, Model } from "../models";
import { DocODM, OldDocOdm } from "./serie.model";

/**
 *
 * @deprecated
 */
export function episodeInSerieToOldDocOdm(episode: EpisodeInSerie): OldDocOdm {
  const objRequired: Required<OldDocOdm> = {
    id: episode.id,
    path: episode.path,
    end: episode.end,
    start: episode.start,
    tags: episode.tags!,
    duration: episode.duration!,
    title: episode.title!,
    disabled: episode.disabled!,
    weight: episode.weight,
  };
  const ret: OldDocOdm = objRequired;

  return ret;
}

export function episodeInSerieToEpisode(episode: EpisodeInSerie, serieId: SerieId): Episode {
  const objRequired: Episode = {
    episodeId: episode.id,
    serieId,
    path: episode.path,
    end: episode.end ?? -1,
    start: episode.start ?? -1,
    title: episode.title ?? "",
    weight: episode.weight ?? 0,
  };

  if (episode.lastTimePlayed !== undefined)
    objRequired.lastTimePlayed = episode.lastTimePlayed;

  if (episode.disabled !== undefined)
    objRequired.disabled = episode.disabled;

  if (episode.duration !== undefined)
    objRequired.duration = episode.duration;

  if (episode.tags !== undefined)
    objRequired.tags = episode.tags;

  const ret: Episode = objRequired;

  return ret;
}

/**
 *
 * @deprecated
 */
export function episodeInSerieFromOldDocOdm(episodeDB: OldDocOdm): EpisodeInSerie {
  const ret: EpisodeInSerie = {
    id: episodeDB.id,
    start: episodeDB.start ?? -1,
    end: episodeDB.end ?? -1,
    title: episodeDB.title ?? "",
    weight: episodeDB.weight ?? 0,
    path: episodeDB.path,
  };

  if (episodeDB.disabled !== undefined)
    ret.disabled = episodeDB.disabled;

  if (episodeDB.tags !== undefined)
    ret.tags = episodeDB.tags;

  if (episodeDB.duration !== undefined)
    ret.duration = episodeDB.duration;

  return ret;
}

/* eslint-disable import/prefer-default-export */
export function serieWithEpisodesDBToSerieWithEpisodes(serieDB: DocODM): Model {
  const episodesInSerieDocOdm: OldDocOdm[] = serieDB.episodes;
  const episodesInSerie: EpisodeInSerie[] = episodesInSerieDocOdm.map((episodeDB: OldDocOdm): EpisodeInSerie =>episodeInSerieFromOldDocOdm(episodeDB));

  return {
    id: serieDB.id,
    name: serieDB.name,
    episodes: episodesInSerie,
  };
}

export function serieWithEpisodesToSerieWithEpisodesDB(serieWithEpisodes: Model): DocODM {
  return {
    id: serieWithEpisodes.id,
    name: serieWithEpisodes.id,
    episodes: serieWithEpisodes.episodes.map(episodeInSerieToOldDocOdm),
  };
}