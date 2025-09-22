import mongoose from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  roleId: mongoose.Types.ObjectId;
};

export type FullDocOdm = RequireId<DocOdm>;

const NAME = "UserRoleMap";
const COLLECTION_NAME = "userRolesMap";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION_NAME,
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
