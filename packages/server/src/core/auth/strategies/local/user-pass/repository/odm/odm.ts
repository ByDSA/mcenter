import mongoose from "mongoose";
import { RequireId, SchemaDef } from "#utils/layers/db/mongoose";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { isTest } from "#utils";

export type DocOdm = {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  username: string;
  passwordHash: string;
  createdAt: Date;

  // Verificación
  verificationToken?: string; // Si es undefined, está verificada
  verificationTokenExpiresAt?: Date;

  // Rate limiting de EMAILS (no de login)
  lastVerificationEmailSentAt?: Date;
  verificationEmailCount?: number;

  // Reset password rate limiting
  lastResetEmailSentAt?: Date;
  resetEmailCount?: number;

  // Login rate limiting (separado)
  failedLoginAttempts?: number;
  lastFailedLoginAt?: Date;
  lockedUntil?: Date;
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
  passwordHash: {
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
  verificationToken: {
    type: String,
    required: false,
  },
  verificationTokenExpiresAt: {
    type: Date,
    required: false,
  },
  lastVerificationEmailSentAt: {
    type: Date,
    required: false,
  },
  verificationEmailCount: {
    type: Number,
    required: false,
  },
  lastResetEmailSentAt: {
    type: Date,
    required: false,
  },
  resetEmailCount: {
    type: Number,
    required: false,
  },
  failedLoginAttempts: {
    type: Number,
    required: false,
  },
  lastFailedLoginAt: {
    type: Date,
    required: false,
  },
  lockedUntil: {
    type: Date,
    required: false,
  },
} satisfies SchemaDef<DocOdm>, {
  collection: COLLECTION_NAME,
  autoIndex: isTest(),
} );

export const ModelOdm = mongoose.model<DocOdm>(NAME, schemaOdm);
