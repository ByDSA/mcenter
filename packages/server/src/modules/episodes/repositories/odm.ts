import { isDefined } from "#shared/utils/validation";
import mongoose from "mongoose";
import { ModelId } from "../models";
import { TimestampsModel } from "#sharedSrc/models/utils/dtos/Timestamps";
import { TimestampsSchemaOdm } from "#modules/resources/odm/Timestamps";

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
  timestamps?: TimestampsModel; // TODO: cambiar a true y modificar episodes en db
}

const NAME = "Episode";

export const SchemaOdm = new mongoose.Schema<DocOdm>( {
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
    type: TimestampsSchemaOdm,
    required: false, // TODO: cambiar a true y modificar episodes en db
  },
}, {
  _id: true,
  autoIndex: false,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, SchemaOdm);

export async function getIdModelOdmFromId(fullId: ModelId) {
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
