import { Types } from "mongoose";
import { fixtureMusics } from "#musics/tests/fixtures";
import { MusicHistoryEntryEntity } from "#musics/history/models";
import { SAMPLE1 as DATE_SAMPLE1 } from "../dates";

export const SAMPLES1: MusicHistoryEntryEntity[] = [
  {
    id: new Types.ObjectId().toString(),
    date: DATE_SAMPLE1,
    resourceId: fixtureMusics.Disk.List[0].id,
    music: fixtureMusics.Disk.List[0],
  },
];
