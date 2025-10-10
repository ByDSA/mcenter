import mongoose, { Types } from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { RemotePlayer, RemotePlayerEntity, RemotePlayerPermissionEntity, remotePlayerPermissionEntitySchema } from "../../models";
import { DocOdm, FullDocOdm, PermissionFullDocOdm } from "./odm";

type Entity = RemotePlayerEntity;
type Model = RemotePlayer;

export function modelToDocOdm(model: Model): DocOdm {
  const docOdm: DocOdm = {
    publicName: model.hostName,
    ownerId: new Types.ObjectId(model.ownerId),
    secretToken: model.secretToken,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function entityToDocOdm(entity: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entity),
    _id: new mongoose.Types.ObjectId(entity.id),
  };
}

export function partialToDocOdm(partial: Partial<Model>): Partial<DocOdm> {
  const ret: Partial<DocOdm> = {
    publicName: partial.hostName,
    ownerId: partial.ownerId ? new Types.ObjectId(partial.ownerId) : undefined,
    secretToken: partial.secretToken,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return ret;
}

function permissionToEntity(permissionDocOdm: PermissionFullDocOdm): RemotePlayerPermissionEntity {
  return remotePlayerPermissionEntitySchema.parse( {
    id: permissionDocOdm._id.toString(),
    remotePlayerId: permissionDocOdm.remotePlayerId.toString(),
    role: permissionDocOdm.role,
    userId: permissionDocOdm.userId.toString(),
    user: undefined,
  } );
}

export function fullDocOdmToEntity(docOdm: FullDocOdm): Entity {
  const entity: Entity = {
    id: docOdm._id.toString(),
    hostName: docOdm.publicName,
    ownerId: docOdm.ownerId.toString(),
    secretToken: docOdm.secretToken,
    owner: docOdm.owner ? UserOdm.toEntity(docOdm.owner) : undefined,
    permissions: docOdm.permissions ? docOdm.permissions.map(permissionToEntity) : undefined,
  } satisfies AllKeysOf<Entity>;

  return removeUndefinedDeep(entity);
}
