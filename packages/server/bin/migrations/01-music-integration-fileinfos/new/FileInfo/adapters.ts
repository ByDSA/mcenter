/* eslint-disable import/prefer-default-export */
import { assertIsDefined } from "$shared/utils/validation";
import { Model as FileInfoVideo, assertIsModel as assertIsFileInfoVideo } from "./FileInfoVideo";
import { DocOdm } from "./odm";

type Model = FileInfoVideo;

const assertIsModel: typeof assertIsFileInfoVideo = assertIsFileInfoVideo;

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