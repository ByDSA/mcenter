import mongoose from "mongoose";
import { Stream, StreamGroup, StreamOrigin } from "../models";

export type DocOdm = Stream;

const NAME = "Stream";
const originSchema = new mongoose.Schema<StreamOrigin>( {
  type: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
} );
const groupSchema = new mongoose.Schema<StreamGroup>( {
  origins: {
    type: [originSchema],
    required: true,
  },
} );

export const schema = new mongoose.Schema<DocOdm>( {
  id: {
    type: String,
    required: true,
  },
  group: {
    type: groupSchema,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schema);
