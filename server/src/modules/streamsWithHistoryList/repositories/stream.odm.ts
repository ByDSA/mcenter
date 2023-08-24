import HistoryEntrySchema from "#modules/historyLists/repositories/HistoryEntry.schema";
import { StreamMode } from "#modules/streams";
import mongoose from "mongoose";
import { Model } from "../models";

export interface DocOdm extends Model {
  id: string;
}

const NAME = "Stream";
const schema = new mongoose.Schema<DocOdm>( {
  id: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    enum: [StreamMode.SEQUENTIAL, StreamMode.RANDOM],
    required: true,
  },
  maxHistorySize: {
    type: Number,
    required: true,
  },
  history: {
    type: [HistoryEntrySchema],
  },
} );

export const ModelOdm = mongoose.model<Model>(NAME, schema);
