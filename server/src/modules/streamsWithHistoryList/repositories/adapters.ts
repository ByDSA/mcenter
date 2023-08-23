/* eslint-disable import/prefer-default-export */
import { Model } from "../models";
import { DocODM } from "./stream.odm";

export function streamDBToStreamWithHistoryList(stream: DocODM): Model {
  return {
    id: stream.id,
    group: stream.group,
    mode: stream.mode,
    maxHistorySize: stream.maxHistorySize,
    history: stream.history,
  };
}