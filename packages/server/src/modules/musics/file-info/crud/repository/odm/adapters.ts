import mongoose, { Types, UpdateQuery } from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { MusicFileInfo, MusicFileInfoEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";

type Entity = MusicFileInfoEntity;

type Model = MusicFileInfo;

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const ret = {
    id: docOdm._id.toString(),
    musicId: docOdm.musicId.toString(),
    path: docOdm.path ?? null,
    hash: docOdm.hash,
    size: docOdm.size,
    offloaded: docOdm.offloaded,
    timestamps: {
      createdAt: docOdm.timestamps?.createdAt,
      updatedAt: docOdm.timestamps?.updatedAt,
    },
    mediaInfo: {
      duration: docOdm.mediaInfo?.duration ?? null,
    },
  } satisfies AllKeysOf<Entity>;

  return ret;
}

export function entityToDocOdm(entity: Entity): DocOdm {
  const ret = {
    _id: new Types.ObjectId(entity.id),
    musicId: new mongoose.Types.ObjectId(entity.musicId),
    path: entity.path,
    hash: entity.hash,
    size: entity.size,
    offloaded: entity.offloaded,
    timestamps: {
      createdAt: entity.timestamps.createdAt,
      updatedAt: entity.timestamps.updatedAt,
    },
    mediaInfo: {
      duration: entity.mediaInfo.duration,
    },
  } satisfies AllKeysOf<DocOdm>;

  return ret;
}

export function partialModelToDocOdm(model: Partial<Model>): UpdateQuery<Model> {
  const ret: UpdateQuery<Model> = {};

  if (model.hash !== undefined)
    ret.hash = model.hash;

  if (model.musicId !== undefined)
    ret.musicId = model.musicId;

  if (model.mediaInfo !== undefined) {
    ret.mediaInfo = {};

    if (model.mediaInfo.duration !== undefined)
      ret.mediaInfo.duration = model.mediaInfo.duration;
  }

  if (model.path !== undefined)
    ret.path = model.path;

  if (model.size !== undefined)
    ret.size = model.size;

  if (model.timestamps !== undefined) {
    ret.timestamps = {};

    if (model.timestamps.createdAt !== undefined)
      ret.timestamps.createdAt = model.timestamps.createdAt;

    if (model.timestamps.updatedAt !== undefined)
      ret.timestamps.updatedAt = model.timestamps.updatedAt;
  }

  return ret;
}
