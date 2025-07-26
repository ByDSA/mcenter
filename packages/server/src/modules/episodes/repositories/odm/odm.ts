import mongoose from "mongoose";
import { TimestampsModel } from "$shared/models/utils/schemas/timestamps";
import { timestampsSchemaOdm } from "#modules/resources/odm/Timestamps";
import { EpisodeFileInfoOdm } from "#episodes/file-info/repositories/odm";
import { RequireId } from "#utils/layers/db/mongoose";
import { SeriesOdm } from "#modules/series/repositories/odm";
import { EpisodeCompKey } from "../../models";

export interface DocOdm {
  _id?: mongoose.Types.ObjectId;
  episodeId: string;
  serieId: string;
  title: string;
  weight: number;
  tags?: string[];
  disabled?: boolean;
  lastTimePlayed?: number;
  timestamps: TimestampsModel;
}

export type FullDocOdm = RequireId<DocOdm> & {
  serie?: SeriesOdm.FullDoc;
  fileInfos?: EpisodeFileInfoOdm.FullDoc[];
};

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
  title: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
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
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);

export async function getIdOdmFromCompKey(compKey: EpisodeCompKey) {
  const episodeOdm = await ModelOdm.findOne( {
    serieId: compKey.seriesKey,
    episodeId: compKey.episodeKey,
  } );

  if (!episodeOdm)
    return null;

  const id = episodeOdm.toObject()._id as mongoose.Types.ObjectId;

  return id;
}
