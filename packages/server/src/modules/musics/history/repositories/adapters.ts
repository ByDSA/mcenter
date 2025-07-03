import { Types } from "mongoose";
import { MusicHistoryEntry } from "../models";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): MusicHistoryEntry {
  return {
    resourceId: docOdm.musicId,
    id: docOdm._id?.toString(),
    date: {
      year: docOdm.date.year,
      month: docOdm.date.month,
      day: docOdm.date.day,
      timestamp: docOdm.date.timestamp,
    },
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
    _id: model.id ? new Types.ObjectId(model.id) : undefined,
  };
}
