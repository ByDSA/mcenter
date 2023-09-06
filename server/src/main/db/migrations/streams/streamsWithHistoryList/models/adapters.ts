import { HistoryEntry, HistoryList, assertIsHistoryList } from "#modules/historyLists";
import { Stream, StreamMode, assertIsStream } from "#modules/streams";
import { OriginType } from "#shared/models/streams/Stream";
import { assertIsDefined } from "#shared/utils/validation";
import HistoryEntryInStream from "./HistoryEntryInStream";
import HistoryListInStream from "./HistoryListInStream";
import StreamWithHistoryList, { assertIsStreamWithHistoryList } from "./StreamWithHistoryList";

/**
 *
 * @deprecated
 */
export function streamWithHistoryListToStream(streamWithHistoryList: StreamWithHistoryList): Stream {
  assertIsStreamWithHistoryList(streamWithHistoryList);
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

  assertIsStream(ret);

  return ret;
}

/**
 * @deprecated
 *
 */
export function streamToStreamWithHistoryList(stream: Stream): StreamWithHistoryList {
  assertIsStream(stream);
  const ret: StreamWithHistoryList = {
    id: stream.id,
    group: stream.group.origins[0].id.split("/").at(-1) ?? stream.group.origins[0].id,
    mode: stream.mode,
    history: [],
    maxHistorySize: -1,
  };

  assertIsStreamWithHistoryList(ret);

  return ret;
}

/**
 *
 * @deprecated
 */
export function streamWithHistoryListToHistoryList(streamWithHistoryList: StreamWithHistoryList): HistoryList {
  assertIsStreamWithHistoryList(streamWithHistoryList);
  const serieId = streamWithHistoryList.group.split("/").at(-1);

  assertIsDefined(serieId);
  const ret: HistoryList =
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
          date: {
            year: date.year,
            month: date.month,
            day: date.day,
            timestamp: date.timestamp ?? new Date(date.year, date.month, date.day).getTime() / 1000,
          },
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
export function historyListToHistoryListInStream(historyList: HistoryList): HistoryListInStream {
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
export function historyListToStreamWithHistoryList(historyList: HistoryList): StreamWithHistoryList {
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