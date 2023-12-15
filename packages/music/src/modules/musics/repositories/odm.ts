import { Music } from "#shared/models/musics";
import mongoose, { Document } from "mongoose";

export interface DocOdm extends Document, Music {
}

const NAME = "Music";

export const SchemaOdm = new mongoose.Schema( {
  hash: {
    type: String,
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
    required: true,
  },
  artist: {
    // TODO: required: true, que cuando se cree siempre ponga un artista: undefined, "", etc
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
  lastTimePlayed: {
    type: Number,
  },
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, SchemaOdm);