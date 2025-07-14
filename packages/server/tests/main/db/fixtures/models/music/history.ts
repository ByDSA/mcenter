import { MusicHistoryEntry } from "#musics/history/models";
import { SAMPLE1 as DATE_SAMPLE1 } from "../dates";
import { MUSIC_FILE_SAMPLES } from "./music";

export const SAMPLES1: MusicHistoryEntry[] = [
  {
    date: DATE_SAMPLE1,
    resourceId: MUSIC_FILE_SAMPLES[0].id,
    resource: MUSIC_FILE_SAMPLES[0],
  },
  {
    date: DATE_SAMPLE1,
    resourceId: MUSIC_FILE_SAMPLES[0].id,
  },
];
