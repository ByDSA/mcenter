/* eslint-disable import/prefer-default-export */
import { EpisodeInterface } from "../../db";
import { Episode } from "../Episode";

export function episodeToEpisodeDB(episode: Episode): EpisodeInterface {
  const objRequired: Required<EpisodeInterface> = {
    id: episode.id.innerId,
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
  const ret: EpisodeInterface = objRequired;

  return ret;
}