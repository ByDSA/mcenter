/* eslint-disable import/prefer-default-export */
import { StreamMode } from "#modules/stream";
import { StreamWithHistoryList } from "#modules/streamWithHistoryList";
import HistoryList from "./HistoryList";

/**
 *
 * @deprecated
 */
export function streamWithHistoryListToHistoryList(streamWithHistoryList: StreamWithHistoryList): HistoryList {
  const ret: HistoryList = {
    id: streamWithHistoryList.id,
    entries: streamWithHistoryList.history,
    maxSize: streamWithHistoryList.maxHistorySize,
  };

  return ret;
}

/**
 *
 * @deprecated
 */
export function historyListToStreamWithHistoryList(historyList: HistoryList): StreamWithHistoryList {
  const ret: StreamWithHistoryList = {
    id: historyList.id,
    group: historyList.id,
    mode: StreamMode.SEQUENTIAL,
    history: historyList.entries,
    maxHistorySize: -1,
  };

  return ret;
}