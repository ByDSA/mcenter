import mongoose from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { isTest } from "#utils";

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  name: string;
};

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "UserRole";
const COLLECTION_NAME = "user_roles";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  name: {
    type: String,
    required: true,
    unique: true,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION_NAME,
  autoIndex: isTest(),
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
