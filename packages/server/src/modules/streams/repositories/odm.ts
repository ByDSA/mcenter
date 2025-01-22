import mongoose from "mongoose";
import { Group, Model, Origin } from "../models";

export type DocOdm = Model;

const NAME = "Stream";
const OriginSchema = new mongoose.Schema<Origin>( {
  type: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
} );
const GroupSchema = new mongoose.Schema<Group>( {
  origins: {
    type: [OriginSchema],
    required: true,
  },
} );

export const Schema = new mongoose.Schema<DocOdm>( {
  id: {
    type: String,
    required: true,
  },
  group: {
    type: GroupSchema,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, Schema);
