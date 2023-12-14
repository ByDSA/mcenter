import mongoose, { Document } from "mongoose";

export interface DocOdm extends Document {
  hash: string;
  title: string;
  url: string;
  path: string;
  weight?: number;
  artist?: string;
  tags?: string[];
  duration?: number;
  disabled?: boolean;
}

const NAME = "Music";

export const SchemaOdm = new mongoose.Schema( {
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
    unique: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  weight: {
    type: Number,
  },
  title: {
    type: String,
  },
  artist: {
    type: String,
  },
  album: {
    type: String,
  },
  duration: {
    type: Number,
  },
  tags: {
    type: [String],
  },
  disabled: {
    type: Boolean,
  },
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, SchemaOdm);