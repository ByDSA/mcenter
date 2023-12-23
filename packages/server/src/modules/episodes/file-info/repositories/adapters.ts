import { FileInfoVideo, FileInfoVideoWithSuperId, assertIsFileInfoVideo, assertIsFileInfoVideoWithSuperId } from "#shared/models/episodes/fileinfo";
import { assertIsDefined } from "#shared/utils/validation";
import mongoose from "mongoose";
import { DocOdm } from "./odm";

type Model = FileInfoVideo;
type ModelWithSuperId = FileInfoVideoWithSuperId;

const assertIsModel: typeof assertIsFileInfoVideo = assertIsFileInfoVideo;
const assertIsModelWithSuperId: typeof assertIsFileInfoVideoWithSuperId = assertIsFileInfoVideoWithSuperId;

export function docOdmToModel(docOdm: DocOdm): Model {
  assertIsDefined(docOdm);
  const model: Model = {
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
  };

  assertIsModel(model);

  return model;
}

export function docOdmToModelWithSuperId(docOdm: DocOdm): ModelWithSuperId {
  assertIsDefined(docOdm);
  const model: ModelWithSuperId = {
    ...docOdmToModel(docOdm),
    episodeId: docOdm.episodeId?.toString(),
  };

  assertIsModelWithSuperId(model);

  return model;
}

export function modelWithSuperIdToDocOdm(model: ModelWithSuperId): DocOdm {
  assertIsModelWithSuperId(model);
  const ret: DocOdm = {
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

  return ret;
}