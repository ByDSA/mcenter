import { MusicOdm } from "#musics/crud/repository/odm";
import { MusicHistoryEntry, MusicHistoryEntryEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): MusicHistoryEntry {
  return {
    resourceId: docOdm.musicId,
    date: {
      year: docOdm.date.year,
      month: docOdm.date.month,
      day: docOdm.date.day,
      timestamp: docOdm.date.timestamp,
    },
  };
}

export function docOdmToEntity(docOdm: FullDocOdm): MusicHistoryEntryEntity {
  return {
    ...docOdmToModel(docOdm),
    id: docOdm._id.toString(),
    resource: docOdm.music ? MusicOdm.toEntity(docOdm.music) : undefined,
  };
}

export function modelToDocOdm(model: MusicHistoryEntry): DocOdm {
  return {
    musicId: model.resourceId,
    date: {
      year: model.date.year,
      month: model.date.month,
      day: model.date.day,
      timestamp: model.date.timestamp,
    },
  };
}
