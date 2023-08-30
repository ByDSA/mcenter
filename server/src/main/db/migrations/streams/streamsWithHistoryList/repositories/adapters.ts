/* eslint-disable import/prefer-default-export */
import { StreamWithHistoryList } from "../models";
import { assertIsStreamWithHistoryList } from "../models/StreamWithHistoryList";
import { DocOdm, assertIsStreamWithHistoryListDocOdm } from "./Stream.odm";

/**
 * @deprecated
 */
export function streamWithHistoryListDocOdmToModel(streamWithHistoryListDocOdm: DocOdm): StreamWithHistoryList {
  assertIsStreamWithHistoryListDocOdm(streamWithHistoryListDocOdm);
  const ret: StreamWithHistoryList = {
    id: streamWithHistoryListDocOdm.id,
    group: streamWithHistoryListDocOdm.group,
    mode: streamWithHistoryListDocOdm.mode,
    maxHistorySize: streamWithHistoryListDocOdm.maxHistorySize,
    history: streamWithHistoryListDocOdm.history.map((entry) => ( {
      episodeId: entry.episodeId,
      date: {
        day: entry.date.day,
        month: entry.date.month,
        year: entry.date.year,
        timestamp: entry.date.timestamp,
      },
    } )),
  };

  assertIsStreamWithHistoryList(ret);

  return ret;
}