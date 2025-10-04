import mongoose from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { UserPassEntity, UserPass } from "$shared/models/auth";
import { MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { DocOdm, FullDocOdm } from "./odm";

type Entity = UserPassEntity;
type Model = UserPass;

export function docOdmToModel(docOdm: DocOdm): Model {
  const model: Model = {
    userId: docOdm.userId.toString(),
    username: docOdm.username,
    passwordHash: docOdm.passwordHash,
    createdAt: docOdm.createdAt,
    failedLoginAttempts: docOdm.failedLoginAttempts,
    lastFailedLoginAt: docOdm.lastFailedLoginAt,
    lastResetEmailSentAt: docOdm.lastResetEmailSentAt,
    lastVerificationEmailSentAt: docOdm.lastVerificationEmailSentAt,
    lockedUntil: docOdm.lockedUntil,
    resetEmailCount: docOdm.resetEmailCount,
    verificationEmailCount: docOdm.verificationEmailCount,
    verificationToken: docOdm.verificationToken,
    verificationTokenExpiresAt: docOdm.verificationTokenExpiresAt,
  } satisfies AllKeysOf<Model>;

  return model;
}

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const entity: Entity = {
    ...docOdmToModel(docOdm) as Required<Model>,
    id: docOdm._id.toString(),
    user: docOdm.user ? UserOdm.toEntity(docOdm.user) : undefined,
  } satisfies AllKeysOf<Entity>;

  return removeUndefinedDeep(entity);
}

export function partialToDocOdm(model: Partial<Model>): MongoUpdateQuery<DocOdm> {
  const docOdm: Partial<DocOdm> = {
    userId: model.userId ? new mongoose.Types.ObjectId(model.userId) : undefined,
    username: model.username,
    passwordHash: model.passwordHash,
    createdAt: model.createdAt,
    verificationToken: model.verificationToken,
    failedLoginAttempts: model.failedLoginAttempts,
    lastFailedLoginAt: model.lastFailedLoginAt,
    lastResetEmailSentAt: model.lastResetEmailSentAt,
    lastVerificationEmailSentAt: model.lastVerificationEmailSentAt,
    lockedUntil: model.lockedUntil,
    resetEmailCount: model.resetEmailCount,
    verificationEmailCount: model.verificationEmailCount,
    verificationTokenExpiresAt: model.verificationTokenExpiresAt,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function modelToDocOdm(model: Model): DocOdm {
  const docOdm: DocOdm = {
    userId: new mongoose.Types.ObjectId(model.userId),
    username: model.username,
    passwordHash: model.passwordHash,
    createdAt: model.createdAt,
    verificationToken: model.verificationToken,
    failedLoginAttempts: model.failedLoginAttempts,
    lastFailedLoginAt: model.lastFailedLoginAt,
    lastResetEmailSentAt: model.lastResetEmailSentAt,
    lastVerificationEmailSentAt: model.lastVerificationEmailSentAt,
    lockedUntil: model.lockedUntil,
    resetEmailCount: model.resetEmailCount,
    verificationEmailCount: model.verificationEmailCount,
    verificationTokenExpiresAt: model.verificationTokenExpiresAt,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function entityToDocOdm(entity: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entity),
    _id: new mongoose.Types.ObjectId(entity.id),
  };
}
