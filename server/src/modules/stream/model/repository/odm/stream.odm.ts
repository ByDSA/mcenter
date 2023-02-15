import mongoose, { Document } from "mongoose";
import { HistorySchema } from "#modules/history/model/repository/odm/history";
import Stream, { Mode } from "../../stream.entity";

interface StreamDocument extends Document, Stream {
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
    enum: [Mode.SEQUENTIAL, Mode.RANDOM],
    required: true,
  },
  maxHistorySize: {
    type: Number,
    required: true,
  },
  history: {
    type: [HistorySchema],
  },
} );
const Model = mongoose.model<StreamDocument>(NAME, schema);

function toModel(stream: StreamDocument): Stream {
  return {
    id: stream.id,
    group: stream.group,
    mode: stream.mode,
    maxHistorySize: stream.maxHistorySize,
    history: stream.history,
  };
}

export {
  schema as StreamSchema, Mode, StreamDocument, Model as StreamModel, toModel,
};
