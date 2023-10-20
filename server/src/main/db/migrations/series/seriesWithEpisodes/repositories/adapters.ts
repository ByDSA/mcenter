import { Episode, assertIsEpisode } from "#modules/episodes";
import { SerieId } from "#modules/series";
import { OnlyWithRequiredKeys, OptionalKeys } from "#shared/utils/objects";
import { EpisodeInSerie, Model } from "../models";
import { assertIsEpisodeInSerie, assertIsSerieWithEpisodes } from "../models/SerieWithEpisodes";
import { EpisodeInSerieDocOdm, SerieWithEpisodesDocODM, assertIsEpisodeInSerieDocOdm, assertIsSerieWithEpisodesDocOdm } from "./odm";

/**
 *
 * @deprecated
 */
export function episodeInSerieToOldDocOdm(episodeInSerie: EpisodeInSerie): EpisodeInSerieDocOdm {
  assertIsEpisodeInSerie(episodeInSerie);
  const ret: EpisodeInSerieDocOdm = {
    id: episodeInSerie.id,
    path: episodeInSerie.path,
    end: episodeInSerie.end,
    start: episodeInSerie.start,
    tags: episodeInSerie.tags,
    title: episodeInSerie.title,
    disabled: episodeInSerie.disabled,
    weight: episodeInSerie.weight,
  };

  assertIsEpisodeInSerieDocOdm(ret);

  return ret;
}

export function episodeInSerieToEpisode(episodeInSerie: EpisodeInSerie, serieId: SerieId): Episode {
  assertIsEpisodeInSerie(episodeInSerie);
  const ret: OnlyWithRequiredKeys<Episode> = {
    episodeId: episodeInSerie.id,
    serieId,
    path: episodeInSerie.path,
    end: episodeInSerie.end ?? -1,
    start: episodeInSerie.start ?? -1,
    title: episodeInSerie.title ?? `${serieId } ${episodeInSerie.id}`,
    weight: episodeInSerie.weight ?? 0,
  };
  const optionalKeys: (OptionalKeys<Episode>)[] = [ "lastTimePlayed", "disabled", "tags" ];

  for (const key of optionalKeys){
    if (episodeInSerie[key] !== undefined)
      (ret as any)[key] = episodeInSerie[key];
  }

  assertIsEpisode(ret);

  return ret;
}

/**
 *
 * @deprecated
 */
export function episodeInSerieDocOdmToModel(episodeInSerieDocOdm: EpisodeInSerieDocOdm): EpisodeInSerie {
  assertIsEpisodeInSerieDocOdm(episodeInSerieDocOdm);
  const ret: OnlyWithRequiredKeys<EpisodeInSerie> = {
    id: episodeInSerieDocOdm.id,
    path: episodeInSerieDocOdm.path,
  };
  const optionalKeys: (OptionalKeys<EpisodeInSerie>)[] = [ "start", "end", "weight", "title","lastTimePlayed", "disabled", "tags" ];

  for (const key of optionalKeys){
    if (episodeInSerieDocOdm[key] !== undefined)
      (ret as any)[key] = episodeInSerieDocOdm[key];
  }

  assertIsEpisodeInSerie(ret);

  return ret;
}

/* eslint-disable import/prefer-default-export */
export function serieWithEpisodesDocOdmToModel(serieDB: SerieWithEpisodesDocODM): Model {
  assertIsSerieWithEpisodesDocOdm(serieDB);
  const episodesInSerieDocOdm: EpisodeInSerieDocOdm[] = serieDB.episodes;
  const episodesInSerie: EpisodeInSerie[] = episodesInSerieDocOdm.map((episodeDB: EpisodeInSerieDocOdm): EpisodeInSerie =>episodeInSerieDocOdmToModel(episodeDB));
  const ret: Model = {
    id: serieDB.id,
    name: serieDB.name,
    episodes: episodesInSerie,
  };

  assertIsSerieWithEpisodes(ret);

  return ret;
}

export function serieWithEpisodesToDocOdm(serieWithEpisodes: Model): SerieWithEpisodesDocODM {
  assertIsSerieWithEpisodes(serieWithEpisodes);

  const ret = {
    id: serieWithEpisodes.id,
    name: serieWithEpisodes.id,
    episodes: serieWithEpisodes.episodes.map(episodeInSerieToOldDocOdm),
  };

  assertIsSerieWithEpisodesDocOdm(ret);

  return ret;
}