import mongoose from "mongoose";
import { SchemaDef } from "#utils/layers/db/mongoose";
import { Stream, StreamGroup, StreamOrigin } from "../../models";

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
} satisfies SchemaDef<StreamOrigin>);
const groupSchema = new mongoose.Schema<StreamGroup>( {
  origins: {
    type: [originSchema],
    required: true,
  },
} satisfies SchemaDef<StreamGroup>);

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
} satisfies SchemaDef<DocOdm>);

export const ModelOdm = mongoose.model<DocOdm>(NAME, schema);
