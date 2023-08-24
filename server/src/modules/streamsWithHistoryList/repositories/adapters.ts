/* eslint-disable import/prefer-default-export */
import { Model } from "../models";
import { DocOdm } from "./stream.odm";

export function streamOdmToStreamWithHistoryList(streamOdm: DocOdm): Model {
  return {
    id: streamOdm.id,
    group: streamOdm.group,
    mode: streamOdm.mode,
    maxHistorySize: streamOdm.maxHistorySize,
    history: streamOdm.history,
  };
}