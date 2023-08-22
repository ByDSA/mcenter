import { HistoryEntrySchema } from "#modules/history/db";
import { StreamMode } from "#modules/stream";
import mongoose, { Document } from "mongoose";
import StreamWithHistoryList from "../StreamWithHistoryList";

interface StreamDocument extends Document, StreamWithHistoryList {
  id: string;
}

const NAME = "Stream";
const schema = new mongoose.Schema( {
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
const Model = mongoose.model<StreamDocument>(NAME, schema);

export {
  StreamDocument as StreamDB, Model as StreamModel, schema as StreamSchema,
};
