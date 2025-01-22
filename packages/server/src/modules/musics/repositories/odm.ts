import { MusicVO } from "#shared/models/musics";
import mongoose from "mongoose";
import { TimestampsSchemaOdm } from "#modules/resources/odm/Timestamps";

export interface DocOdm extends MusicVO {
  _id: mongoose.Types.ObjectId;
  onlyTags?: string[];
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
    type: TimestampsSchemaOdm,
    required: true,
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
    required: false,
    default: undefined,
  },
  onlyTags: {
    type: [String],
    required: false,
    default: undefined,
  },
  disabled: {
    type: Boolean,
  },
  lastTimePlayed: {
    type: Number,
  },
  game: {
    type: String,
  },
  country: {
    type: String,
  },
  year: {
    type: Number,
  },
} );

export const ModelOdm = mongoose.model<MusicVO>(NAME, SchemaOdm);
