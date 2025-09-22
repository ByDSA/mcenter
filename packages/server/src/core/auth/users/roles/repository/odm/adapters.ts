import mongoose from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { UserRole, UserRoleEntity } from "../../repository";
import { parseUserRole } from "../../role";
import { DocOdm, FullDocOdm } from "./odm";

type Entity = UserRoleEntity;
type Model = UserRole;

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const entity: Entity = {
    id: docOdm._id.toString(),
    name: parseUserRole(docOdm.name),
  } satisfies AllKeysOf<Entity>;

  return entity;
}

export function modelToDocOdm(model: Model): DocOdm {
  const docOdm: DocOdm = {
    name: model.name,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function musicEntityToDocOdm(entity: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entity),
    _id: new mongoose.Types.ObjectId(entity.id),
  };
}
