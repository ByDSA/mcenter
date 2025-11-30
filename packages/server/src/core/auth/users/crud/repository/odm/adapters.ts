import mongoose, { Types } from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { UserRoleOdm } from "#core/auth/users/roles/repository/odm";
import { MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { User, UserEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";

type Entity = UserEntity;
type Model = User;

export function docOdmToModel(docOdm: DocOdm): Model {
  const entity: Model = {
    email: docOdm.email,
    publicName: docOdm.publicName,
    publicUsername: docOdm.publicUsername,
    firstName: docOdm.firstName,
    lastName: docOdm.lastName,
    emailVerified: docOdm.emailVerified,
    musics: {
      favoritesPlaylistId: docOdm.musics.favoritesPlaylistId?.toString() ?? null,
    },
  } satisfies AllKeysOf<Model>;

  return removeUndefinedDeep(entity);
}

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const entity: Entity = {
    ...docOdmToModel(docOdm) as Required<Model>,
    id: docOdm._id.toString(),
    createdAt: docOdm.createdAt,
    updatedAt: docOdm.updatedAt,
    roles: docOdm.roles?.map(UserRoleOdm.toEntity),
  } satisfies AllKeysOf<Entity>;

  return entity;
}

export function partialToDocOdm(model: Partial<Model>): MongoUpdateQuery<DocOdm> {
  const docOdm: Partial<DocOdm> = {
    email: model.email,
    publicName: model.publicName,
    publicUsername: model.publicUsername,
    firstName: model.firstName,
    lastName: model.lastName,
    emailVerified: model.emailVerified,
    createdAt: undefined,
    updatedAt: undefined,
    musics: model.musics
        && {
          favoritesPlaylistId: model.musics.favoritesPlaylistId
            ? new Types.ObjectId(model.musics.favoritesPlaylistId)
            : null,
        },
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function modelToDocOdm(model: Model): TimestampsOdm.OmitAutoTimestamps<DocOdm> {
  const docOdm: TimestampsOdm.OmitAutoTimestamps<DocOdm> = {
    email: model.email,
    publicName: model.publicName,
    publicUsername: model.publicUsername,
    firstName: model.firstName,
    lastName: model.lastName,
    emailVerified: model.emailVerified,
    musics: {
      favoritesPlaylistId: model.musics.favoritesPlaylistId
        ? new Types.ObjectId(model.musics.favoritesPlaylistId)
        : null,
    },
  } satisfies AllKeysOf<TimestampsOdm.OmitAutoTimestamps<Omit<DocOdm, "_id">>>;

  return removeUndefinedDeep(docOdm);
}

export function musicEntityToDocOdm(entity: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entity),
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    _id: new mongoose.Types.ObjectId(entity.id),
  };
}
