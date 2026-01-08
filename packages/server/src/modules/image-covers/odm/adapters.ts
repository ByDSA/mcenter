import mongoose from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { ImageCover, ImageCoverEntity } from "$shared/models/image-cover";
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
    },
    createdAt: docOdm.createdAt,
    updatedAt: docOdm.updatedAt,
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
    },
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}

export function musicEntityToDocOdm(entity: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entity),
    _id: new mongoose.Types.ObjectId(entity.id),
  };
}
