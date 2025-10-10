import mongoose, { Schema } from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { UserOdm } from "#core/auth/users/crud/repository/odm";

export type PermissionFullDocOdm = {
  _id: mongoose.Types.ObjectId;
  remotePlayerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: string;
};

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  secretToken: string;
  publicName: string;
  ownerId: mongoose.Types.ObjectId;
};

export type FullDocOdm = RequireId<DocOdm> & {
  owner?: UserOdm.FullDoc;
  permissions?: PermissionFullDocOdm[];
};

const NAME = "RemotePlayer";

export const schemaOdm = new mongoose.Schema<DocOdm>( {
  publicName: {
    type: String,
    required: true,
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  secretToken: {
    type: String,
    required: true,
    unique: true,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: "remote_players",
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
