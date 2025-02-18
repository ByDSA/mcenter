import mongoose from "mongoose";

export interface DocOdm {
  _id?: mongoose.Types.ObjectId;
  episodeId: mongoose.Types.ObjectId;
  path: string;
  hash: string;
  size: number;
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

const NAME = "EpisodeFileInfo";

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
}, {
  autoIndex: false,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
