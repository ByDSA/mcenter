import type { EpisodeHistoryEntryEntity } from "../";
import { ObjectId } from "mongodb";
import { fixtureUsers } from "../../../auth/tests/fixtures";
import { deepFreeze } from "../../../../utils/objects";
import { STREAM_SIMPSONS } from "../../streams/tests";
import { SAMPLE1 as DATE_SAMPLE1 } from "../../../../../tests/other-fixtures/dates";
import { fixtureEpisodes } from "../../tests";

const HISTORY_ENTRY_SIMPSONS1: EpisodeHistoryEntryEntity = {
  id: new ObjectId().toString(),
  resourceId: fixtureEpisodes.Simpsons.Samples.EP1x01.id,
  date: DATE_SAMPLE1,
  streamId: STREAM_SIMPSONS.id,
  userId: fixtureUsers.Normal.User.id,
};
const HISTORY_ENTRY_SIMPSONS_6_25: EpisodeHistoryEntryEntity = {
  id: new ObjectId().toString(),
  resourceId: fixtureEpisodes.Simpsons.Samples.Dependency.last.id,
  date: DATE_SAMPLE1,
  streamId: STREAM_SIMPSONS.id,
  userId: fixtureUsers.Normal.User.id,
};
const HISTORY_ENTRIES_SIMPSONS: EpisodeHistoryEntryEntity[] = deepFreeze([
  HISTORY_ENTRY_SIMPSONS1,
  HISTORY_ENTRY_SIMPSONS_6_25,
] satisfies EpisodeHistoryEntryEntity[]);

export const fixtureEpisodeHistoryEntries = {
  Simpsons: {
    Samples: {
      EP1x01: HISTORY_ENTRY_SIMPSONS1,
      EP6x25: HISTORY_ENTRY_SIMPSONS_6_25,
    },
    List: HISTORY_ENTRIES_SIMPSONS,
  },
};
