import { Music } from "#shared/models/musics";
import mongoose, { Document } from "mongoose";

export interface DocOdm extends Document, Music {
}

const NAME = "Music";

export const SchemaOdm = new mongoose.Schema( {
  // Parte FileInfo a quitar
  hash: {
    type: String,
    unique: true,
  },
  size: {
    type: Number,
    default: null, // TODO: quitar cuando se haya actualizado la base de datos de producción
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
      default: null, // TODO: quitar cuando se haya actualizado la base de datos de producción
    },
    updatedAt: {
      type: Date,
      default: null, // TODO: quitar cuando se haya actualizado la base de datos de producción
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
    // TODO: quitar default cuando se haya actualizado la base de datos de producción
    default: 0,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
    // TODO: quitar default cuando se haya actualizado la base de datos de producción
    default: "",
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

export const ModelOdm = mongoose.model<DocOdm>(NAME, SchemaOdm);