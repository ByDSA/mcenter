import mongoose, { Types } from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { MusicOdm } from "#musics/crud/repositories/music/odm";
import { MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { ImageCoverOdm } from "#modules/image-covers/repositories/odm";
import { MusicPlaylist, MusicPlaylistEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";

type Entity = MusicPlaylistEntity;
type Model = MusicPlaylist;

function entryFullDocOdmToEntity(docOdm: FullDocOdm["list"][0]): Entity["list"][0] {
  return removeUndefinedDeep( {
    ...entryDocOdmToModel(docOdm),
    music: docOdm.music ? MusicOdm.toEntity(docOdm.music) : undefined,
  } );
}

export function entryDocOdmToModel(docOdm: DocOdm["list"][0]): Model["list"][0] {
  return {
    musicId: docOdm.musicId.toString(),
    id: docOdm._id.toString(),
    addedAt: docOdm.addedAt,
  };
}

export function entryModelToDocOdm(model: Model["list"][0]): DocOdm["list"][0] {
  return {
    musicId: new Types.ObjectId(model.musicId),
    _id: new Types.ObjectId(model.id),
    addedAt: model.addedAt,
  };
}

function entryEntityToDocOdm(entity: Entity["list"][0]): FullDocOdm["list"][0] {
  return {
    ...entryModelToDocOdm(entity),
    _id: new Types.ObjectId(entity.id),
    music: entity.music ? MusicOdm.toFullDoc(entity.music) : undefined,
  };
}

function commonModelToDocOdm(model: Model): Omit<DocOdm, "_id" | "list"> {
  return {
    name: model.name,
    slug: model.slug,
    userId: new Types.ObjectId(model.ownerUserId),
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    visibility: model.visibility,
  };
}

export function fullDocOdmToEntity(docOdm: FullDocOdm): Entity {
  const entity: Entity = {
    id: docOdm._id.toString(),
    name: docOdm.name,
    slug: docOdm.slug,
    ownerUser: docOdm.ownerUser ? UserOdm.toEntity(docOdm.ownerUser) : undefined,
    ownerUserId: docOdm.userId.toString(),
    ownerUserPublic: docOdm.ownerUserPublic
      ? {
        slug: docOdm.ownerUserPublic.publicUsername,
        publicName: docOdm.ownerUserPublic.publicName,
      }
      : undefined,
    list: docOdm.list.map(entryFullDocOdmToEntity),
    createdAt: docOdm.createdAt,
    updatedAt: docOdm.updatedAt,
    visibility: docOdm.visibility,
    imageCoverId: docOdm.imageCoverId ? docOdm.imageCoverId.toString() : null,
    imageCover: docOdm.imageCover ? ImageCoverOdm.toEntity(docOdm.imageCover) : undefined,
  } satisfies AllKeysOf<Entity>;

  return entity;
}

export function modelToDocOdm(model: Model): DocOdm {
  const docOdm: DocOdm = {
    ...commonModelToDocOdm(model),
    list: model.list.map(entryModelToDocOdm),
    imageCoverId: model.imageCoverId ? new Types.ObjectId(model.imageCoverId) : null,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function partialModelToUpdateQuery(model: Partial<Entity>): MongoUpdateQuery<DocOdm> {
  const ret: MongoUpdateQuery<DocOdm> = {
    name: model.name,
    slug: model.slug,
    list: model.list?.map(entryModelToDocOdm),
    visibility: model.visibility,
  };

  if (model.imageCoverId !== undefined) {
    if (model.imageCoverId === null)
      ret.imageCoverId = null;
    else
      ret.imageCoverId = new Types.ObjectId(model.imageCoverId);
  }

  return removeUndefinedDeep(ret);
}

export function entityToFullDocOdm(entity: Entity): FullDocOdm {
  return removeUndefinedDeep( {
    _id: new mongoose.Types.ObjectId(entity.id),
    ...commonModelToDocOdm(entity),
    list: entity.list.map(entryEntityToDocOdm),

  } );
}
