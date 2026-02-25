import mongoose, { Schema, Types } from "mongoose";
import { OptionalId, RequireId, SchemaDef } from "#utils/layers/db/mongoose";

export type DocOdm = OptionalId & {
  movieId: Types.ObjectId;
  path: string;
  hash: string;
  size: number;
  offloaded?: boolean;
  mediaInfo: {
    duration: number | null;
    resolution: {
      width: number | null;
      height: number | null;
    };
    fps: string | null;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
  };
};

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "MovieFileInfo";

export const COLLECTION = "movie_file_infos";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  movieId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Movie",
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  hash: {
    type: String,
    unique: true,
  },
  size: {
    type: Number,
    required: true,
  },
  offloaded: {
    type: Boolean,
    required: false,
  },
  mediaInfo: {
    duration: {
      type: Number,
      default: null,
    },
    resolution: {
      width: {
        type: Number,
        default: null,
      },
      height: {
        type: Number,
        default: null,
      },
    },
    fps: {
      type: String,
      default: null,
    },
  },
  timestamps: {
    createdAt: Date,
    updatedAt: Date,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION,
  autoIndex: false,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
