/* eslint-disable import/prefer-default-export */
import { StreamWithHistoryList } from "../models";
import { DocOdm } from "./Stream.odm";

/**
 * @deprecated
 */
export function streamOdmToStreamWithHistoryList(streamOdm: DocOdm): StreamWithHistoryList {
  return {
    id: streamOdm.id,
    group: streamOdm.group,
    mode: streamOdm.mode,
    maxHistorySize: streamOdm.maxHistorySize,
    history: streamOdm.history,
  };
}