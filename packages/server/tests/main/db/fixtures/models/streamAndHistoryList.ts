import type { StreamEntity } from "#modules/streams";
import type { EpisodeHistoryEntryEntity } from "#episodes/history/models";
import { deepFreeze } from "$shared/utils/objects";
import { Types } from "mongoose";
import { StreamMode, StreamOriginType } from "#modules/streams";
import { SAMPLE1 as DATE_SAMPLE1 } from "./dates";

export const HISTORY_ENTRIES_WITH_NO_ENTRIES: EpisodeHistoryEntryEntity[] = deepFreeze([]);

export const STREAM_SIMPSONS: StreamEntity = deepFreeze( {
  id: new Types.ObjectId().toString(),
  key: "simpsons",
  group: {
    origins: [
      {
        type: StreamOriginType.SERIE,
        id: "simpsons",
      },
    ],
  },
  mode: StreamMode.RANDOM,
} satisfies StreamEntity);

export const HISTORY_ENTRY_SIMPSONS1: EpisodeHistoryEntryEntity = {
  id: new Types.ObjectId().toString(),
  episodeCompKey: {
    episodeKey: "1x01",
    seriesKey: "simpsons",
  },
  date: DATE_SAMPLE1,
  streamId: STREAM_SIMPSONS.id,
};

export const HISTORY_ENTRIES_SIMPSONS: EpisodeHistoryEntryEntity[] = deepFreeze([
  HISTORY_ENTRY_SIMPSONS1,
] satisfies EpisodeHistoryEntryEntity[]);
