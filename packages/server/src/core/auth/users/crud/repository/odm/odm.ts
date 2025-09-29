import mongoose from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { UserRoleOdm } from "#core/auth/users/roles/repository/odm";
import { isTest } from "#utils";

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  email: string;
  publicName: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
};

export type FullDocOdm = RequireId<DocOdm> & {
  roles?: UserRoleOdm.FullDoc[];
};

const NAME = "User";
const COLLECTION_NAME = "users";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  email: {
    type: String,
    required: true,
    unique: true,
  },
  publicName: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  emailVerified: {
    type: Boolean,
    required: true,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION_NAME,
  autoIndex: isTest(),
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
