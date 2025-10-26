import mongoose, { Schema } from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { isTest } from "#utils";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";

export type DocOdm = TimestampsOdm.AutoTimestamps & {
  _id?: mongoose.Types.ObjectId;
  weight: number;
  tags?: string[];
  lastTimePlayed: number;
  userId: mongoose.Types.ObjectId;
  episodeId: mongoose.Types.ObjectId;
};

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "EpisodesUsers";

export const COLLECTION = "episodes_users";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  episodeId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
    default: 0,
  },
  tags: {
    type: [String],
    required: false,
    default: undefined,
  },
  lastTimePlayed: {
    type: Number,
    default: 0,
  },
} satisfies SchemaDef<TimestampsOdm.OmitAutoTimestamps<DocOdm>>, {
  collection: COLLECTION,
  versionKey: false,
  timestamps: true,
  autoIndex: isTest(),
} );

schemaOdm.index( {
  episodeId: 1,
  userId: 1,
}, {
  unique: true,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
