import mongoose, { Types } from "mongoose";
import { assertIsDefined } from "$shared/utils/validation";
import { AllKeysOf } from "$shared/utils/types";
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

export function partialModelToDocOdm(model: Partial<Model>): Partial<DocOdm> {
  const ret: Partial<DocOdm> = {
    start: model.start,
    end: model.end,
    hash: model.hash,
    episodeId: model.episodeId ? new Types.ObjectId(model.episodeId) : undefined,
    path: model.path,
    size: model.size,
    mediaInfo: model.mediaInfo !== undefined
      ? {
        duration: model.mediaInfo.duration,
        fps: model.mediaInfo.fps,
        resolution: model.mediaInfo.resolution,
      }
      : undefined,
    timestamps: model.timestamps !== undefined
      ? {
        createdAt: model.timestamps.createdAt,
        updatedAt: model.timestamps.updatedAt,
      }
      : undefined,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return ret;
}
