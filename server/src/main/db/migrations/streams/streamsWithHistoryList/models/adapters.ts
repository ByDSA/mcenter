import { HistoryEntry, HistoryList as Model, assertIsHistoryList } from "#modules/historyLists";
import { Stream, StreamMode } from "#modules/streams";
import { OriginType } from "#modules/streams/models/Stream";
import { assertIsDefined } from "#utils/validation";
import HistoryEntryInStream from "./HistoryEntryInStream";
import HistoryListInStream from "./HistoryListInStream";
import StreamWithHistoryList from "./StreamWIthHistoryList";

/**
 *
 * @deprecated
 */
export function streamWithHistoryListToStream(streamWithHistoryList: StreamWithHistoryList): Stream {
  const ret: Stream = {
    id: streamWithHistoryList.id,
    group: {
      origins: [
        {
          type: OriginType.SERIE,
          id: streamWithHistoryList.group.split("/").at(-1) ?? streamWithHistoryList.group,
        },
      ],
    },
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
    group: stream.group.origins[0].id.split("/").at(-1) ?? stream.group.origins[0].id,
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
  const serieId = streamWithHistoryList.group.split("/").at(-1);

  assertIsDefined(serieId);
  const ret: Model =
    {
      id: streamWithHistoryList.id,
      entries: streamWithHistoryList.history.map((entry) => {
        const {episodeId} = entry;

        assertIsDefined(episodeId, `episodeId is not defined in history of serie ${serieId}`);
        const {date} = entry;

        assertIsDefined(date);
        const retEntry: HistoryEntry = {
          episodeId,
          serieId,
          date,
        };

        return retEntry;
      } ),
      maxSize: streamWithHistoryList.maxHistorySize,
    };

  assertIsHistoryList(ret);

  return ret;
}

/**
 * @deprecated
 */
export function historyListToHistoryListInStream(historyList: Model): HistoryListInStream {
  assertIsDefined(historyList);
  const ret: HistoryListInStream = historyList.entries.map((entry) => {
    const retEntry: HistoryEntryInStream = {
      episodeId: entry.episodeId,
      date: entry.date,
    };

    return retEntry;
  } );

  return ret;
}

/**
 *
 * @deprecated
 */
export function historyListToStreamWithHistoryList(historyList: Model): StreamWithHistoryList {
  assertIsHistoryList(historyList);
  const ret: StreamWithHistoryList = {
    id: historyList.id,
    group: historyList.id,
    mode: StreamMode.SEQUENTIAL,
    history: historyListToHistoryListInStream(historyList),
    maxHistorySize: -1,
  };

  return ret;
}