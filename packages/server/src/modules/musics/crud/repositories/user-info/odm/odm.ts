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
  musicId: mongoose.Types.ObjectId;
};

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "MusicsUsers";

export const COLLECTION = "musics_users";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  musicId: {
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
  musicId: 1,
  userId: 1,
}, {
  unique: true,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
