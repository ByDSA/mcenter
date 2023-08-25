import { HistoryEntry } from "#modules/historyLists";
import { SerieId } from "#modules/series";
import { StreamMode } from "#modules/streams";
import { StreamWithHistoryList } from "#modules/streamsWithHistoryList";
import HistoryList, { HistoryListId } from "../../historyLists/models/HistoryList";
import HistoryEntryInStream from "./HistoryEntryInStream";
import HistoryListInStream from "./HistoryListInStream";

/**
 *
 * @deprecated
 */
export function streamWithHistoryListToHistoryList(streamWithHistoryList: StreamWithHistoryList): HistoryList {
  const ret: HistoryList = historyListInStreamToHistoryList(streamWithHistoryList.history, streamWithHistoryList.id, streamWithHistoryList.group);

  return ret;
}

/**
 * @deprecated
 */
export function historyListToHistoryListInStream(historyList: HistoryList): HistoryListInStream {
  const ret: HistoryListInStream = historyList.entries.map((entry) => {
    const retEntry: HistoryEntryInStream = {
      id: entry.episodeId,
      date: entry.date,
    };

    return retEntry;
  } );

  return ret;
}

/**
 * @deprecated
 */
export function historyListInStreamToHistoryList(historyListInStream: HistoryListInStream, historyListId: HistoryListId, serieId: SerieId): HistoryList {
  const ret: HistoryList = {
    id: historyListId,
    entries: historyListInStream.map((entry) => {
      const retEntry: HistoryEntry = {
        episodeId: entry.id,
        serieId,
        date: entry.date,
      };

      return retEntry;
    } ),
    maxSize: -1,
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
    history: historyListToHistoryListInStream(historyList),
    maxHistorySize: -1,
  };

  return ret;
}