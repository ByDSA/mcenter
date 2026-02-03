import mongoose from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { ImageCover, ImageCoverEntity } from "$shared/models/image-covers";
import { MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { DocOdm, FullDocOdm } from "./odm";

type Model = ImageCover;
type Entity = ImageCoverEntity;

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const entity: Entity = {
    id: docOdm._id.toString(),
    metadata: {
      label: docOdm.metadata.label,
    },
    versions: {
      original: docOdm.versions.original,
      small: docOdm.versions.small,
      medium: docOdm.versions.medium,
      large: docOdm.versions.large,
    },
    createdAt: docOdm.createdAt,
    updatedAt: docOdm.updatedAt,
    uploaderUserId: docOdm.uploaderUserId.toString(),
  } satisfies AllKeysOf<Entity>;

  return removeUndefinedDeep(entity);
}

export function modelToDocOdm(model: Model): DocOdm {
  const docOdm: DocOdm = {
    metadata: {
      label: model.metadata.label,
    },
    versions: {
      original: model.versions.original,
      small: model.versions.small,
      medium: model.versions.medium,
      large: model.versions.large,
    },
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    uploaderUserId: new mongoose.Types.ObjectId(model.uploaderUserId),
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function musicEntityToDocOdm(entity: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entity),
    _id: new mongoose.Types.ObjectId(entity.id),
  };
}

export function partialToDocOdm(model: Partial<Model>): MongoUpdateQuery<DocOdm> {
  const docOdm: MongoUpdateQuery<DocOdm> = {
    "metadata.label": model.metadata?.label,
    "versions.original": model.versions?.original,
    "versions.small": model.versions?.small,
    "versions.medium": model.versions?.medium,
    "versions.large": model.versions?.large,
  };

  return removeUndefinedDeep(docOdm);
}
