/* eslint-disable import/prefer-default-export */
import { StreamMode } from "#modules/streams";
import { StreamWithHistoryList } from "#modules/streamsWithHistoryList";
import { HistoryEntryInStream } from "#modules/streamsWithHistoryList/models";
import { deepFreeze } from "#utils/objects";

const HISTORY_ENTRY_IN_STREAM_SIMPSONS1: HistoryEntryInStream = {
  id : "1x01",
  date : {
    year : 2020,
    day: 1,
    month: 1,
    timestamp : 0,
  },
};

export const STREAM_WITH_HISTORY_LIST_SIMPSONS: StreamWithHistoryList = deepFreeze( {
  id : "simpsons",
  group : "simpsons",
  maxHistorySize : 99999,
  mode : StreamMode.RANDOM,
  history : [
    HISTORY_ENTRY_IN_STREAM_SIMPSONS1,
  ],
} as StreamWithHistoryList,
);