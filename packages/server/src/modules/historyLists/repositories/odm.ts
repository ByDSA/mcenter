import { DateType } from "#shared/utils/time";
import mongoose from "mongoose";
import { DateTypeOdmSchema } from "#utils/time";
import { HistoryList } from "../models";

export type EntryDocOdm = {
  date: DateType;
  episodeId: string;
  serieId: string;
};

export const entrySchema = new mongoose.Schema<EntryDocOdm>( {
  date: {
    type: DateTypeOdmSchema,
    required: true,
  },
  episodeId: {
    type: String,
    required: true,
  },
  serieId: {
    type: String,
    required: true,
  },
} );

export type DocOdm = Omit<HistoryList, "entries"> & {
  entries: EntryDocOdm[];
};

const NAME = "HistoryList";

export const schemaOdm = new mongoose.Schema<DocOdm>(
  {
    id: {
      type: String,
      required: true,
    },
    entries: {
      type: [entrySchema],
      required: true,
    },
    maxSize: {
      type: Number,
      required: true,
    },
  },
  {
    collection: "historyLists",
  },
);

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
