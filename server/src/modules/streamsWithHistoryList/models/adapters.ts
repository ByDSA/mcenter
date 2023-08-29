import { HistoryEntry } from "#modules/historyLists";
import { SerieId } from "#modules/series";
import { Stream, StreamMode } from "#modules/streams";
import { StreamWithHistoryList } from "#modules/streamsWithHistoryList";
import Model, { ModelId } from "../../historyLists/models/HistoryList";
import HistoryEntryInStream from "./HistoryEntryInStream";
import HistoryListInStream from "./HistoryListInStream";

/**
 *
 * @deprecated
 */
export function streamWithHistoryListToStream(streamWithHistoryList: StreamWithHistoryList): Stream {
  const ret: Stream = {
    id: streamWithHistoryList.id,
    group: streamWithHistoryList.group,
    mode: streamWithHistoryList.mode,
  };

  return ret;
}

/**
 * @deprecated
 *
 */
export function streamToStreamWithHistoryList(stream: Stream): StreamWithHistoryList {
  const ret: StreamWithHistoryList = {
    id: stream.id,
    group: stream.group,
    mode: stream.mode,
    history: [],
    maxHistorySize: -1,
  };

  return ret;
}

/**
 *
 * @deprecated
 */
export function streamWithHistoryListToHistoryList(streamWithHistoryList: StreamWithHistoryList): Model {
  const ret: Model = historyListInStreamToHistoryList(streamWithHistoryList.history, streamWithHistoryList.id, streamWithHistoryList.group);

  return ret;
}

/**
 * @deprecated
 */
export function historyListToHistoryListInStream(historyList: Model): HistoryListInStream {
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
export function historyListInStreamToHistoryList(historyListInStream: HistoryListInStream, historyListId: ModelId, serieId: SerieId): Model {
  const ret: Model = {
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
export function historyListToStreamWithHistoryList(historyList: Model): StreamWithHistoryList {
  const ret: StreamWithHistoryList = {
    id: historyList.id,
    group: historyList.id,
    mode: StreamMode.SEQUENTIAL,
    history: historyListToHistoryListInStream(historyList),
    maxHistorySize: -1,
  };

  return ret;
}