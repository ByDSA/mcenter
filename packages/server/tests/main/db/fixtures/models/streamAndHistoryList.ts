import type { Stream } from "#modules/streams";
import type { EpisodeHistoryEntry, EpisodeHistoryListEntity } from "#episodes/history/models";
import { deepFreeze } from "$shared/utils/objects";
import { StreamMode, StreamOriginType } from "#modules/streams";
import { SAMPLE1 as DATE_SAMPLE1 } from "./dates";

export const HISTORY_LIST_WITH_NO_ENTRIES: EpisodeHistoryListEntity = deepFreeze( {
  id: "id",
  maxSize: 10,
  entries: [],
} );
const HISTORY_ENTRY_SIMPSONS1: EpisodeHistoryEntry = {
  episodeId: {
    innerId: "1x01",
    serieId: "simpsons",
  },
  date: DATE_SAMPLE1,
};

export const STREAM_SIMPSONS: Stream = deepFreeze( {
  id: "simpsons",
  group: {
    origins: [
      {
        type: StreamOriginType.SERIE,
        id: "simpsons",
      },
    ],
  },
  mode: StreamMode.RANDOM,
} as Stream);

export const HISTORY_LIST_SIMPSONS: EpisodeHistoryListEntity = deepFreeze( {
  id: "simpsons",
  maxSize: 99999,
  entries: [
    HISTORY_ENTRY_SIMPSONS1,
  ],
} as EpisodeHistoryListEntity);
