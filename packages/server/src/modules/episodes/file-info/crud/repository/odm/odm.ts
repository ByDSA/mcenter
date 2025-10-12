import mongoose from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";

export interface DocOdm {
  _id?: mongoose.Types.ObjectId;
  episodeId: mongoose.Types.ObjectId;
  path: string;
  hash: string;
  size: number;
  start?: number;
  end?: number;
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
  };
  mediaInfo: {
    duration: number | null;
    resolution: {
      width: number | null;
      height: number | null;
    };
    fps: string | null;
  };
}

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "EpisodeFileInfo";

export const COLLECTION = "episode_file_infos";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  episodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Episode",
  },
  path: {
    type: String,
    unique: true,
  },
  size: Number,
  start: {
    type: Number,
    required: false,
  },
  end: {
    type: Number,
    required: false,
  },
  timestamps: {
    createdAt: Date,
    updatedAt: Date,
  },
  hash: {
    type: String,
    required: false,
  },
  mediaInfo: {
    duration: Number,
    resolution: {
      width: Number,
      height: Number,
    },
    fps: String,
  },
} satisfies SchemaDef<DocOdm>, {
  autoIndex: false,
  collection: COLLECTION,
  versionKey: false,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
