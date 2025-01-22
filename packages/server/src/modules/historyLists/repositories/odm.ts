import { DateType } from "#shared/utils/time";
import mongoose from "mongoose";
import { Model } from "../models";
import { DateTypeOdmSchema } from "#utils/time";

export type EntryDocOdm = {
  date: DateType;
  episodeId: string;
  serieId: string;
};

export const EntrySchema = new mongoose.Schema<EntryDocOdm>( {
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

export type DocOdm = Omit<Model, "entries"> & {
  entries: EntryDocOdm[];
};

const NAME = "HistoryList";

export const Schema = new mongoose.Schema<DocOdm>(
  {
    id: {
      type: String,
      required: true,
    },
    entries: {
      type: [EntrySchema],
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

export const ModelOdm = mongoose.model<DocOdm>(NAME, Schema);
