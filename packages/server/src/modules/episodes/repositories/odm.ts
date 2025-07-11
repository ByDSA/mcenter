import { isDefined } from "#shared/utils/validation";
import mongoose from "mongoose";
import { timestampsSchemaOdm } from "#modules/resources/odm/Timestamps";
import { EpisodeId } from "../models";
import { TimestampsModel } from "#sharedSrc/models/utils/schemas/Timestamps";

export interface DocOdm {
  _id?: mongoose.Types.ObjectId;
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
  timestamps?: TimestampsModel; // TODO: cambiar a obligado y modificar episodes en db
}

const NAME = "Episode";

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
    required: false, // TODO: cambiar a true y modificar episodes en db
  },
}, {
  _id: true,
  autoIndex: false,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);

export async function getIdModelOdmFromId(fullId: EpisodeId) {
  const episodeOdm = await ModelOdm.findOne( {
    serieId: fullId.serieId,
    episodeId: fullId.innerId,
  } );

  if (!episodeOdm)
    return null;

  const id = episodeOdm.toObject()._id as mongoose.Types.ObjectId;

  if (!isDefined(id))
    return null;

  return id;
}
