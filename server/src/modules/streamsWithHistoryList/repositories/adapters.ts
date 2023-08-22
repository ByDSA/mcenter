/* eslint-disable import/prefer-default-export */
import { Model } from "../models";
import { DocumentODM } from "./stream.odm";

export function streamDBToStreamWithHistoryList(stream: DocumentODM): Model {
  return {
    id: stream.id,
    group: stream.group,
    mode: stream.mode,
    maxHistorySize: stream.maxHistorySize,
    history: stream.history,
  };
}