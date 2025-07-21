import mongoose from "mongoose";
import { timestampsSchemaOdm } from "../episodes/Timestamps";
import { Music } from "./music";

export interface DocOdm extends Omit<Music, "id"> {
  _id: mongoose.Types.ObjectId;
  onlyTags?: string[];
}

const NAME = "OldMusic";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  // TODO: Parte FileInfo a quitar
  hash: {
    type: String,
    unique: true,
  },
  spotifyId: {
    type: String,
    required: false,
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
    type: timestampsSchemaOdm,
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
}, {
  collection: "musics",
} );

export const ModelOdm = mongoose.model<Music>(NAME, schemaOdm);
