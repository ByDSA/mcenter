import mongoose from "mongoose";
import { TimestampsModel } from "$shared/models/utils/schemas/timestamps";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { EpisodeFileInfoOdm } from "#episodes/file-info/crud/repository/odm";
import { MongoFilterQuery, OptionalId, RequireId } from "#utils/layers/db/mongoose";
import { SeriesOdm } from "#modules/series/crud/repository/odm";
import { EpisodeCompKey } from "../../../models";

export type EpisodeCompKeyOdm = {
  episodeKey: string;
  seriesKey: string;
};

export type DocOdm = EpisodeCompKeyOdm & OptionalId & {
  title: string;
  weight: number;
  tags?: string[];
  disabled?: boolean;
  lastTimePlayed?: number;
  timestamps: TimestampsModel;
  uploaderUserId: mongoose.Types.ObjectId;
};

export type FullDocOdm = RequireId<DocOdm> & {
  serie?: SeriesOdm.FullDoc;
  fileInfos?: EpisodeFileInfoOdm.FullDoc[];
};

const NAME = "Episode";

export const COLLECTION = "episodes";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  episodeKey: {
    type: String,
    required: true,
  },
  seriesKey: {
    type: String,
    required: true,
  },
  uploaderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
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
    type: TimestampsOdm.schema,
    required: true,
  },
}, {
  collection: COLLECTION,
  autoIndex: false,
  versionKey: false,
} );

schemaOdm.index( {
  episodeKey: 1,
  seriesKey: 1,
}, {
  unique: true,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);

export async function getIdOdmFromCompKey(compKey: EpisodeCompKey) {
  const filter = {
    seriesKey: compKey.seriesKey,
    episodeKey: compKey.episodeKey,
  } satisfies MongoFilterQuery<DocOdm>;
  const episodeOdm = await ModelOdm.findOne(filter);

  if (!episodeOdm)
    return null;

  const id = episodeOdm.toObject()._id as mongoose.Types.ObjectId;

  return id;
}
