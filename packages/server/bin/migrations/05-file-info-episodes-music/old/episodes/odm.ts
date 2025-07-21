import mongoose from "mongoose";
import { TimestampsModel } from "$shared/models/utils/schemas/timestamps";
import { timestampsSchemaOdm } from "./Timestamps";
import { EpisodeId } from "./episode";

export interface DocOdm {
  _id: mongoose.Types.ObjectId;
  episodeId: string;
  serieId: string;
  path: string;
  title: string;
  weight: number;
  start?: number;
  end?: number;
  tags?: string[];
  disabled?: boolean;
  lastTimePlayed?: number;
  timestamps: TimestampsModel;
}

const NAME = "OldEpisode";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
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
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  start: {
    type: Number,
  },
  end: {
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
  timestamps: {
    type: timestampsSchemaOdm,
    required: true,
  },
}, {
  _id: true,
  autoIndex: false,
  collection: "episodes"
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);

export async function getIdModelOdmFromId(fullId: EpisodeId) {
  const episodeOdm = await ModelOdm.findOne( {
    serieId: fullId.serieId,
    episodeId: fullId.code,
  } );

  if (!episodeOdm)
    return null;

  const id = episodeOdm.toObject()._id as mongoose.Types.ObjectId;

  return id;
}
