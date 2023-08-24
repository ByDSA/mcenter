import mongoose from "mongoose";

export interface DocOdm {
  episodeId: string;
  serieId: string;
  path: string;
  title?: string;
  weight?: number;
  start?: number;
  end?: number;
  duration?: number;
  tags?: string[];
  disabled?: boolean;
  lastTimePlayed?: number;
}

const NAME = "Episode";

export const Schema = new mongoose.Schema<DocOdm>( {
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
  duration: {
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
  _id: false,
  autoIndex: false,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, Schema);
