import mongoose, { Types } from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { MusicOdm } from "#musics/crud/repository/odm";
import { MongoUpdateQuery } from "#utils/layers/db/mongoose";
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
  };
}

export function entryModelToDocOdm(model: Model["list"][0]): DocOdm["list"][0] {
  return {
    musicId: new Types.ObjectId(model.musicId),
    _id: new Types.ObjectId(model.id),
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
    userId: new Types.ObjectId(model.userId),
    timestamps: TimestampsOdm.toDocOdm(model.timestamps),
  };
}

export function fullDocOdmToEntity(docOdm: FullDocOdm): Entity {
  const entity: Entity = {
    id: docOdm._id.toString(),
    name: docOdm.name,
    slug: docOdm.slug,
    user: docOdm.user ? null : undefined, // TODO: cambiar cuando hayan users
    userId: docOdm.userId.toString(),
    list: docOdm.list.map(entryFullDocOdmToEntity),
    timestamps: TimestampsOdm.toModel(docOdm.timestamps),
  } satisfies AllKeysOf<Entity>;

  return entity;
}

export function modelToDocOdm(model: Model): DocOdm {
  const docOdm: DocOdm = {
    ...commonModelToDocOdm(model),
    list: model.list.map(entryModelToDocOdm),
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function partialModelToUpdateQuery(model: Partial<Entity>): MongoUpdateQuery<DocOdm> {
  const ret: MongoUpdateQuery<DocOdm> = {
    name: model.name,
    list: model.list?.map(entryModelToDocOdm),
  };

  return removeUndefinedDeep(ret);
}

export function entityToFullDocOdm(entity: Entity): FullDocOdm {
  return removeUndefinedDeep( {
    _id: new mongoose.Types.ObjectId(entity.id),
    ...commonModelToDocOdm(entity),
    list: entity.list.map(entryEntityToDocOdm),

  } );
}
