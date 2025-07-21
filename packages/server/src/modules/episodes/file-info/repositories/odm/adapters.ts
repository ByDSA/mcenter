import mongoose, { Types, UpdateQuery } from "mongoose";
import { assertIsDefined } from "$shared/utils/validation";
import { EpisodeFileInfo, EpisodeFileInfoEntity, assertIsEpisodeFileInfoEntity } from "#episodes/file-info/models";
import { DocOdm, FullDocOdm } from "./odm";

type Entity = EpisodeFileInfoEntity;

type Model = EpisodeFileInfo;

const assertIsEntity: typeof assertIsEpisodeFileInfoEntity = assertIsEpisodeFileInfoEntity;

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  assertIsDefined(docOdm);
  const ret: Entity = {
    id: docOdm._id.toString(),
    episodeId: docOdm.episodeId.toString(),
    path: docOdm.path ?? null,
    hash: docOdm.hash,
    size: docOdm.size,
    start: docOdm.start,
    end: docOdm.end,
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
  } satisfies Entity;

  assertIsEntity(ret);

  return ret;
}

export function modelToDocOdm(model: Model): DocOdm {
  assertIsEntity(model);
  const ret: DocOdm = {
    episodeId: new mongoose.Types.ObjectId(model.episodeId),
    path: model.path,
    hash: model.hash,
    size: model.size,
    start: model.start,
    end: model.end,
    timestamps: {
      createdAt: model.timestamps.createdAt,
      updatedAt: model.timestamps.updatedAt,
    },
    mediaInfo: {
      duration: model.mediaInfo.duration,
      resolution: {
        width: model.mediaInfo.resolution.width,
        height: model.mediaInfo.resolution.height,
      },
      fps: model.mediaInfo.fps,
    },
  };

  return ret;
}

export function entityToDocOdm(entity: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entity),
    _id: new Types.ObjectId(entity.id),
  };
}

export function partialModelToDocOdm(model: Partial<Model>): UpdateQuery<Model> {
  const ret: UpdateQuery<Model> = {};

  if (model.start !== undefined)
    ret.start = model.start;

  if (model.end !== undefined)
    ret.end = model.end;

  if (model.hash !== undefined)
    ret.hash = model.hash;

  if (model.episodeId !== undefined)
    ret.episodeId = model.episodeId;

  if (model.mediaInfo !== undefined) {
    ret.mediaInfo = {};

    if (model.mediaInfo.duration !== undefined)
      ret.mediaInfo.duration = model.mediaInfo.duration;

    if (model.mediaInfo.fps !== undefined)
      ret.mediaInfo.fps = model.mediaInfo.fps;

    if (model.mediaInfo.resolution !== undefined)
      ret.mediaInfo.resolution = model.mediaInfo.resolution;
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
