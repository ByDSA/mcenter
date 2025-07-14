import { HistoryEntry, HistoryEntryEntity, HistoryListEntity, HistoryListId } from "../models";
import { DocOdm } from "./odm";

export function docOdmToEntity(docOdm: DocOdm): HistoryListEntity {
  return {
    id: docOdm.id,
    maxSize: docOdm.maxSize,
    entries: docOdm.entries.map((entry)=>entryDocOdmToEntryEntity(entry, docOdm.id)),
  };
}

export function getIdFromEntry(entry: HistoryEntry): string {
  return entry.date.timestamp.toString();
}

export function entryDocOdmToEntryEntity(entryDocOdm: DocOdm["entries"][0], historyListId: HistoryListId): HistoryEntryEntity {
  return {
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

export function entityToDocOdm(model: HistoryListEntity): DocOdm {
  return {
    id: model.id,
    maxSize: model.maxSize,
    entries: model.entries.map(entryToDocOdm),
  };
}
