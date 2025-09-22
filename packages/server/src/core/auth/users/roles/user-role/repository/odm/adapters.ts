import mongoose from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { UserRoleMapEntity, UserRoleMap } from "../../userRole.entity";
import { DocOdm, FullDocOdm } from "./odm";

type Entity = UserRoleMapEntity;
type Model = UserRoleMap;

export function modelToDocOdm(model: Model): DocOdm {
  const docOdm: DocOdm = {
    roleId: new mongoose.Types.ObjectId(model.roleId),
    userId: new mongoose.Types.ObjectId(model.userId),
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function docOdmToModel(doc: DocOdm): Model {
  return {
    roleId: doc.roleId.toString(),
    userId: doc.userId.toString(),
  } satisfies AllKeysOf<Model>;
}

export function docOdmToEntity(doc: FullDocOdm): Entity {
  return {
    ...docOdmToModel(doc),
    id: doc._id.toString(),
  } satisfies AllKeysOf<Entity>;
}
