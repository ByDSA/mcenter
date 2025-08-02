import type { EpisodeHistoryEntryEntity } from "../";
import { ObjectId } from "mongodb";
import { deepFreeze } from "../../../../utils/objects";
import { STREAM_SIMPSONS } from "../../../streams/tests";
import { SAMPLE1 as DATE_SAMPLE1 } from "../../../../../tests/other-fixtures/dates";

export const HISTORY_ENTRIES_WITH_NO_ENTRIES: EpisodeHistoryEntryEntity[] = deepFreeze([]);

export const HISTORY_ENTRY_SIMPSONS1: EpisodeHistoryEntryEntity = {
  id: new ObjectId().toString(),
  episodeCompKey: {
    episodeKey: "1x01",
    seriesKey: "simpsons",
  },
  date: DATE_SAMPLE1,
  streamId: STREAM_SIMPSONS.id,
};

export const HISTORY_ENTRY_SIMPSONS_6_25: EpisodeHistoryEntryEntity = {
  id: new ObjectId().toString(),
  episodeCompKey: {
    episodeKey: "6x25",
    seriesKey: "simpsons",
  },
  date: DATE_SAMPLE1,
  streamId: STREAM_SIMPSONS.id,
};

export const HISTORY_ENTRIES_SIMPSONS: EpisodeHistoryEntryEntity[] = deepFreeze([
  HISTORY_ENTRY_SIMPSONS1,
] satisfies EpisodeHistoryEntryEntity[]);
