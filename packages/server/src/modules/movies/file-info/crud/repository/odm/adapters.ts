import mongoose, { Types, UpdateQuery } from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { MovieFileInfo, MovieFileInfoEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";

type Entity = MovieFileInfoEntity;
type Model = MovieFileInfo;

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const ret = {
    id: docOdm._id.toString(),
    movieId: docOdm.movieId.toString(),
    path: docOdm.path,
    hash: docOdm.hash,
    size: docOdm.size,
    offloaded: docOdm.offloaded,
    timestamps: {
      createdAt: docOdm.timestamps?.createdAt,
      updatedAt: docOdm.timestamps?.updatedAt,
    },
    mediaInfo: {
      duration: docOdm.mediaInfo?.duration ?? null,
      resolution: {
        width: docOdm.mediaInfo?.resolution?.width ?? null,
        height: docOdm.mediaInfo?.resolution?.height ?? null,
      },
      fps: docOdm.mediaInfo?.fps ?? null,
    },
  } satisfies AllKeysOf<Entity>;

  return ret;
}

export function entityToDocOdm(entity: Entity): DocOdm {
  const ret = {
    _id: new Types.ObjectId(entity.id),
    movieId: new mongoose.Types.ObjectId(entity.movieId),
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
      resolution: {
        width: entity.mediaInfo.resolution.width,
        height: entity.mediaInfo.resolution.height,
      },
      fps: entity.mediaInfo.fps,
    },
  } satisfies AllKeysOf<DocOdm>;

  return ret;
}

export function partialModelToDocOdm(model: Partial<Model>): UpdateQuery<Model> {
  const ret: UpdateQuery<Model> = {};

  if (model.hash !== undefined)
    ret.hash = model.hash;

  if (model.movieId !== undefined)
    ret.movieId = new Types.ObjectId(model.movieId);

  if (model.mediaInfo !== undefined) {
    ret.mediaInfo = {};

    if (model.mediaInfo.duration !== undefined)
      ret.mediaInfo.duration = model.mediaInfo.duration;

    if (model.mediaInfo.resolution !== undefined)
      ret.mediaInfo.resolution = model.mediaInfo.resolution;

    if (model.mediaInfo.fps !== undefined)
      ret.mediaInfo.fps = model.mediaInfo.fps;
  }

  if (model.path !== undefined)
    ret.path = model.path;

  if (model.size !== undefined)
    ret.size = model.size;

  if (model.offloaded !== undefined)
    ret.offloaded = model.offloaded;

  if (model.timestamps !== undefined) {
    ret.timestamps = {};

    if (model.timestamps.createdAt !== undefined)
      ret.timestamps.createdAt = model.timestamps.createdAt;

    if (model.timestamps.updatedAt !== undefined)
      ret.timestamps.updatedAt = model.timestamps.updatedAt;
  }

  return ret;
}
