import mongoose from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  weight: number;
  tags?: string[];
  lastTimePlayed: number;
};

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "MusicsUsers";

export const COLLECTION = "musics_users";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  weight: {
    type: Number,
    required: true,
  },
  tags: {
    type: [String],
    required: false,
    default: undefined,
  },
  lastTimePlayed: {
    type: Number,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION,
  versionKey: false,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
