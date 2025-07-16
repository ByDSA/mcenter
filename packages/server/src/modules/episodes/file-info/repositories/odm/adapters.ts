import mongoose from "mongoose";
import { assertIsDefined } from "$shared/utils/validation";
import { FileInfoVideo, FileInfoVideoEntity, assertIsFileInfoVideoEntity } from "#episodes/file-info/models";
import { DocOdm } from "../odm";

type Entity = FileInfoVideoEntity;

type Model = FileInfoVideo;

const assertIsEntity: typeof assertIsFileInfoVideoEntity = assertIsFileInfoVideoEntity;

export function docOdmToEntity(docOdm: DocOdm): Entity {
  assertIsDefined(docOdm);
  const model: Entity = {
    id: docOdm._id.toString(),
    episodeId: docOdm.episodeId.toString(),
    path: docOdm.path ?? null,
    hash: docOdm.hash,
    size: docOdm.size,
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

  return model;
}

export function docOdmToModelWithSuperId(docOdm: DocOdm): Entity {
  assertIsDefined(docOdm);
  const model: Entity = {
    ...docOdmToEntity(docOdm),
    episodeId: docOdm.episodeId?.toString(),
  };

  assertIsEntity(model);

  return model;
}

export function modelToDocOdm(model: Model): DocOdm {
  assertIsEntity(model);
  const ret: Omit<DocOdm, "_id"> = {
    episodeId: new mongoose.Types.ObjectId(model.episodeId),
    path: model.path,
    hash: model.hash,
    size: model.size,
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

  return ret as DocOdm;
}
