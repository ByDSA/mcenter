import mongoose, { Schema, Types } from "mongoose";
import { OptionalId, RequireId, SchemaDef } from "#utils/layers/db/mongoose";

export type DocOdm = OptionalId & {
  musicId: Types.ObjectId;
  path: string;
  hash: string;
  size: number;
  mediaInfo: {
    duration: number | null;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
  };
};

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  musicId: {
    type: Schema.ObjectId,
    required: true,
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
  mediaInfo: {
    duration: {
      type: Number,
      default: null,
    },
  },
  timestamps: {
    createdAt: Date,
    updatedAt: Date,
  },
} satisfies SchemaDef<DocOdm>, {
  autoIndex: false,
} );

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "MusicFileInfo";

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
