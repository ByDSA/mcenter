import { ObjectId } from "mongodb";
import { fixtureUsers } from "../../../auth/tests/fixtures";
import { fixtureMusics } from "../../tests";
import { MusicHistoryEntryEntity } from "../";
import { SAMPLE1 as DATE_SAMPLE1 } from "../../../../../tests/other-fixtures/dates";

export const HISTORY_MUSIC_SAMPLES1: MusicHistoryEntryEntity[] = [
  {
    id: new ObjectId().toString(),
    date: DATE_SAMPLE1,
    resourceId: fixtureMusics.Disk.List[0].id,
    resource: fixtureMusics.Disk.List[0],
    userId: fixtureUsers.Normal.User.id,
  },
];
