import mongoose from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { isTest } from "#utils";

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  password: string;
  createdAt: Date;
};

export type FullDocOdm = RequireId<DocOdm> & {
  user?: UserOdm.FullDoc;
};

const NAME = "UserPass";
const COLLECTION_NAME = "userPasses";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION_NAME,
  autoIndex: isTest(),
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
