/* eslint-disable import/prefer-default-export */
import StreamWithHistoryList from "./StreamWithHistoryList";
import { StreamDB } from "./odm/stream.odm";

export function streamDBToStreamWithHistoryList(stream: StreamDB): StreamWithHistoryList {
  return {
    id: stream.id,
    group: stream.group,
    mode: stream.mode,
    maxHistorySize: stream.maxHistorySize,
    history: stream.history,
  };
}