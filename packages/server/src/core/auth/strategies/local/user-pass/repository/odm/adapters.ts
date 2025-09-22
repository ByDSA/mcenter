import mongoose from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { UserPass, UserPassEntity } from "../../userPass.entity";
import { DocOdm, FullDocOdm } from "./odm";

type Entity = UserPassEntity;
type Model = UserPass;

export function docOdmToModel(docOdm: DocOdm): Model {
  const model: Model = {
    userId: docOdm.userId.toString(),
    username: docOdm.username,
    password: docOdm.password,
    createdAt: docOdm.createdAt,
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
    userId: new mongoose.Types.ObjectId(model.userId),
    username: model.username,
    password: model.password,
    createdAt: model.createdAt,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function modelToDocOdm(model: Model): DocOdm {
  const docOdm: DocOdm = {
    userId: new mongoose.Types.ObjectId(model.userId),
    username: model.username,
    password: model.password,
    createdAt: model.createdAt,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function entityToDocOdm(entity: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entity),
    _id: new mongoose.Types.ObjectId(entity.id),
  };
}
