import { deepFreeze } from "#shared/utils/objects";
import { SAMPLE1 as DATE_SAMPLE1 } from "./dates";
import { HistoryEntry, HistoryList } from "#modules/historyLists/models";
import { Stream, StreamMode, StreamOriginType } from "#modules/streams";

export const HISTORY_LIST_WITH_NO_ENTRIES: HistoryList = deepFreeze( {
  id: "id",
  maxSize: 10,
  entries: [],
} );
const HISTORY_ENTRY_SIMPSONS1: HistoryEntry = {
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

export const HISTORY_LIST_SIMPSONS: HistoryList = deepFreeze( {
  id: "simpsons",
  maxSize: 99999,
  entries: [
    HISTORY_ENTRY_SIMPSONS1,
  ],
} as HistoryList);
