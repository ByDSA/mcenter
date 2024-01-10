/* eslint-disable import/prefer-default-export */
import { HistoryMusicEntry } from "#shared/models/musics";
import { SAMPLE1 as DATE_SAMPLE1 } from "../dates";
import { MUSIC_FILE_SAMPLES, MUSIC_FILE_VO_SAMPLES } from "./music";

export const SAMPLES1: HistoryMusicEntry[] = [
  {
    date: DATE_SAMPLE1,
    resourceId: MUSIC_FILE_SAMPLES[0].id,
    resource: MUSIC_FILE_VO_SAMPLES[0],
  },
  {
    date: DATE_SAMPLE1,
    resourceId: MUSIC_FILE_SAMPLES[0].id,
  },
];