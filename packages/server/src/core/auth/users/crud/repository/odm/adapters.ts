import mongoose from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { UserRoleOdm } from "#core/auth/users/roles/repository/odm";
import { MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { User, UserEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";

type Entity = UserEntity;
type Model = User;

export function docOdmToModel(docOdm: DocOdm): Model {
  const entity: Model = {
    email: docOdm.email,
    publicName: docOdm.publicName,
    firstName: docOdm.firstName,
    lastName: docOdm.lastName,
    emailVerified: docOdm.emailVerified,
  } satisfies AllKeysOf<Model>;

  return removeUndefinedDeep(entity);
}

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const entity: Entity = {
    ...docOdmToModel(docOdm) as Required<Model>,
    id: docOdm._id.toString(),
    roles: docOdm.roles?.map(UserRoleOdm.toEntity),
  } satisfies AllKeysOf<Entity>;

  return entity;
}

export function partialToDocOdm(model: Partial<Model>): MongoUpdateQuery<DocOdm> {
  const docOdm: Partial<DocOdm> = {
    email: model.email,
    publicName: model.publicName,
    firstName: model.firstName,
    lastName: model.lastName,
    emailVerified: model.emailVerified,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function modelToDocOdm(model: Model): DocOdm {
  const docOdm: DocOdm = {
    email: model.email,
    publicName: model.publicName,
    firstName: model.firstName,
    lastName: model.lastName,
    emailVerified: model.emailVerified,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function musicEntityToDocOdm(entity: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entity),
    _id: new mongoose.Types.ObjectId(entity.id),
  };
}
