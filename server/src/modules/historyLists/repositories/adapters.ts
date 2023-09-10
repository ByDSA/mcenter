/* eslint-disable import/prefer-default-export */
import { Entry, EntryWithId, Model, ModelId } from "../models";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Model {
  return {
    id: docOdm.id,
    maxSize: docOdm.maxSize,
    entries: docOdm.entries.map((entry)=>entryDocOdmToModel(entry, docOdm.id)),
  };
}

export function entryDocOdmToModel(entryDocOdm: DocOdm["entries"][0], historyListId: ModelId): EntryWithId {
  return {
    id: entryDocOdm.date.timestamp.toString(),
    historyListId,
    serieId: entryDocOdm.serieId,
    episodeId: entryDocOdm.episodeId,
    date: {
      year: entryDocOdm.date.year,
      month: entryDocOdm.date.month,
      day: entryDocOdm.date.day,
      timestamp: entryDocOdm.date.timestamp,
    },
  };
}

export function entryToDocOdm(entry: Entry): DocOdm["entries"][0] {
  return {
    serieId: entry.serieId,
    episodeId: entry.episodeId,
    date: {
      year: entry.date.year,
      month: entry.date.month,
      day: entry.date.day,
      timestamp: entry.date.timestamp,
    },
  };
}

export function modelToDocOdm(model: Model): DocOdm {
  return {
    id: model.id,
    maxSize: model.maxSize,
    entries: model.entries.map(entryToDocOdm),
  };
}