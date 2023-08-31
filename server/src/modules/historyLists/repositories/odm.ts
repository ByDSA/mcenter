import { DateTypeOdmSchema } from "#utils/time";
import mongoose from "mongoose";
import { Entry, Model } from "../models";

export const EntrySchema = new mongoose.Schema<Entry>( {
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

export interface DocOdm extends Model {
}

const NAME = "HistoryList";

export const Schema = new mongoose.Schema<DocOdm>( {
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
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, Schema);