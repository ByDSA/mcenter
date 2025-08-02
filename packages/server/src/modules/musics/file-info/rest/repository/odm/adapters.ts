import mongoose, { Types, UpdateQuery } from "mongoose";
import { MusicFileInfo, MusicFileInfoEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";

type Entity = MusicFileInfoEntity;

type Model = MusicFileInfo;

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const ret: Entity = {
    id: docOdm._id.toString(),
    musicId: docOdm.musicId.toString(),
    path: docOdm.path ?? null,
    hash: docOdm.hash,
    size: docOdm.size,
    timestamps: {
      createdAt: docOdm.timestamps?.createdAt,
      updatedAt: docOdm.timestamps?.updatedAt,
    },
    mediaInfo: {
      duration: docOdm.mediaInfo?.duration ?? null,
    },
  };

  return ret;
}

export function modelToDocOdm(model: Model): DocOdm {
  return {
    musicId: new mongoose.Types.ObjectId(model.musicId),
    path: model.path,
    hash: model.hash,
    size: model.size,
    timestamps: {
      createdAt: model.timestamps.createdAt,
      updatedAt: model.timestamps.updatedAt,
    },
    mediaInfo: {
      duration: model.mediaInfo.duration,
    },
  };
}

export function entityToDocOdm(entity: Entity): DocOdm {
  const ret = modelToDocOdm(entity);

  ret._id = new Types.ObjectId(entity.id);

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
