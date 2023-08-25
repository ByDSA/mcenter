import { StreamMode } from "#modules/streams";
import mongoose from "mongoose";
import { StreamWithHistoryList } from "../models";
import { HistoryEntryInStreamSchema } from "./History.odm";

/**
 * @deprecated
 */
export interface DocOdm extends StreamWithHistoryList {
  id: string;
}

const NAME = "Stream";

/**
 * @deprecated
 */
export const Schema = new mongoose.Schema<DocOdm>( {
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
    type: [HistoryEntryInStreamSchema],
  },
} );

/**
 * @deprecated
 */
export const ModelOdm = mongoose.model<StreamWithHistoryList>(NAME, Schema);
