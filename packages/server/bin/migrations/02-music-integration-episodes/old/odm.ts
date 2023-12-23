import mongoose from "mongoose";

export interface DocOdm {
  _id: mongoose.Types.ObjectId;
  episodeId: string;
  serieId: string;
  path: string;
  title?: string;
  weight?: number;
  start?: number;
  end?: number;
  tags?: string[];
  disabled?: boolean;
  lastTimePlayed?: number;
}

export const SchemaOdm = new mongoose.Schema<DocOdm>( {
  episodeId: {
    type: String,
    required: true,
    unique: true,
  },
  serieId: {
    type: String,
    required: true,
    unique: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
  },
  weight: {
    type: Number,
  },
  start: {
    type: Number,
  },
  end: {
    type: Number,
  },
  tags: {
    type: [String],
    default: undefined,
  },
  disabled: {
    type: Boolean,
  },
  lastTimePlayed: {
    type: Number,
  },
}, {
  _id: true,
  autoIndex: false,
} );