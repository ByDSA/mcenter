import type { EpisodeHistoryEntryEntity } from "../";
import { ObjectId } from "mongodb";
import { fixtureUsers } from "../../../auth/tests/fixtures";
import { deepFreeze } from "../../../../utils/objects";
import { STREAM_SAMPLE, STREAM_SIMPSONS } from "../../streams/tests";
import { DATEJS_SAMPLE1 } from "../../../../../tests/other-fixtures/dates";
import { fixtureEpisodes } from "../../tests";

const HISTORY_ENTRY_SIMPSONS1: EpisodeHistoryEntryEntity = {
  id: new ObjectId().toString(),
  resourceId: fixtureEpisodes.Simpsons.Samples.EP1x01.id,
  date: DATEJS_SAMPLE1,
  streamId: STREAM_SIMPSONS.id,
  userId: fixtureUsers.Normal.User.id,
};
const HISTORY_ENTRY_SIMPSONS_6_25: EpisodeHistoryEntryEntity = {
  id: new ObjectId().toString(),
  resourceId: fixtureEpisodes.Simpsons.Samples.Dependency.last.id,
  date: DATEJS_SAMPLE1,
  streamId: STREAM_SIMPSONS.id,
  userId: fixtureUsers.Normal.User.id,
};
const HISTORY_ENTRIES_SIMPSONS: EpisodeHistoryEntryEntity[] = deepFreeze([
  HISTORY_ENTRY_SIMPSONS1,
  HISTORY_ENTRY_SIMPSONS_6_25,
] satisfies EpisodeHistoryEntryEntity[]);
const HISTORY_ENTRY_SAMPLE1: EpisodeHistoryEntryEntity = {
  id: new ObjectId().toString(),
  resourceId: fixtureEpisodes.SampleSeries.Samples.EP1x01.id,
  date: DATEJS_SAMPLE1,
  streamId: STREAM_SAMPLE.id,
  userId: fixtureUsers.Normal.User.id,
};

export const fixtureEpisodeHistoryEntries = {
  SampleSeries: {
    Samples: {
      EP1x01: HISTORY_ENTRY_SAMPLE1,
    },
    List: [
      HISTORY_ENTRY_SAMPLE1,
    ],
  },
  Simpsons: {
    Samples: {
      EP1x01: HISTORY_ENTRY_SIMPSONS1,
      EP6x25: HISTORY_ENTRY_SIMPSONS_6_25,
    },
    List: HISTORY_ENTRIES_SIMPSONS,
  },
};
