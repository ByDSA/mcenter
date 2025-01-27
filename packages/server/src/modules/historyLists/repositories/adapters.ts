import { HistoryEntry, HistoryEntryWithId, HistoryList, HistoryListId } from "../models";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): HistoryList {
  return {
    id: docOdm.id,
    maxSize: docOdm.maxSize,
    entries: docOdm.entries.map((entry)=>entryDocOdmToModel(entry, docOdm.id)),
  };
}

export function entryDocOdmToModel(entryDocOdm: DocOdm["entries"][0], historyListId: HistoryListId): HistoryEntryWithId {
  return {
    id: entryDocOdm.date.timestamp.toString(),
    historyListId,
    episodeId: {
      innerId: entryDocOdm.episodeId,
      serieId: entryDocOdm.serieId,
    },
    date: {
      year: entryDocOdm.date.year,
      month: entryDocOdm.date.month,
      day: entryDocOdm.date.day,
      timestamp: entryDocOdm.date.timestamp,
    },
  };
}

export function entryToDocOdm(entry: HistoryEntry): DocOdm["entries"][0] {
  return {
    episodeId: entry.episodeId.innerId,
    serieId: entry.episodeId.serieId,
    date: {
      year: entry.date.year,
      month: entry.date.month,
      day: entry.date.day,
      timestamp: entry.date.timestamp,
    },
  };
}

export function modelToDocOdm(model: HistoryList): DocOdm {
  return {
    id: model.id,
    maxSize: model.maxSize,
    entries: model.entries.map(entryToDocOdm),
  };
}
