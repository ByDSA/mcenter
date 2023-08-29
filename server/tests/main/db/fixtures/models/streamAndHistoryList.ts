import { HistoryEntry, HistoryList } from "#modules/historyLists";
import { Stream, StreamMode } from "#modules/streams";
import { OriginType } from "#modules/streams/models/Stream";
import { deepFreeze } from "#utils/objects";

const HISTORY_ENTRY_SIMPSONS1: HistoryEntry = {
  episodeId : "1x01",
  serieId : "simpsons",
  date : {
    year : 2020,
    day: 1,
    month: 1,
    timestamp : 0,
  },
};

export const STREAM_SIMPSONS: Stream = deepFreeze( {
  id : "simpsons",
  group : {
    origins : [
      {
        type : OriginType.SERIE,
        id : "simpsons",
      },
    ],
  },
  mode : StreamMode.RANDOM,
} as Stream);

export const HISTORY_LIST_SIMPSONS: HistoryList = deepFreeze( {
  id : "simpsons",
  maxSize : 99999,
  entries : [
    HISTORY_ENTRY_SIMPSONS1,
  ],
} as HistoryList,
);