import { MusicVO } from "#shared/models/musics";
import mongoose from "mongoose";

export interface DocOdm extends MusicVO {
  _id: mongoose.Types.ObjectId;
}

const NAME = "Music";

export const SchemaOdm = new mongoose.Schema<DocOdm>( {
  // TODO: Parte FileInfo a quitar
  hash: {
    type: String,
    unique: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mediaInfo: {
    duration: {
      type: Number,
      default: null,
    },
  },
  timestamps: {
    createdAt: {
      type: Date,
      required: true,
    },
    updatedAt: {
      type: Date,
      required: true,
    },
  },
  // END
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
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  album: {
    type: String,
  },
  tags: {
    type: [String],
  },
  disabled: {
    type: Boolean,
  },
  lastTimePlayed: {
    type: Number,
  },
} );

export const ModelOdm = mongoose.model<MusicVO>(NAME, SchemaOdm);