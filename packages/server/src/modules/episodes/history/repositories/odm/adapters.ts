import { EpisodeHistoryEntry as Entry, EpisodeHistoryEntryEntity as EntryEntity, EpisodeHistoryListEntity as ListEntity, EpisodeHistoryListId as HistoryListId } from "../../models";
import { DocOdm } from "./mongo";

function docOdmToEntity(docOdm: DocOdm): ListEntity {
  return {
    id: docOdm.id,
    maxSize: docOdm.maxSize,
    entries: docOdm.entries.map((entry)=>entryDocOdmToEntryEntity(entry, docOdm.id)),
  };
}

function entryDocOdmToEntryEntity(entryDocOdm: DocOdm["entries"][0], historyListId: HistoryListId): EntryEntity {
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

function entryToDocOdm(entry: Entry): DocOdm["entries"][0] {
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

function entityToDocOdm(model: ListEntity): DocOdm {
  return {
    id: model.id,
    maxSize: model.maxSize,
    entries: model.entries.map(entryToDocOdm),
  };
}

export {
  docOdmToEntity,
  entityToDocOdm,
  entryDocOdmToEntryEntity,
  entryToDocOdm,
};
