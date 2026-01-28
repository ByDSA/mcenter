import { Types } from "mongoose";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { Serie, SerieEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";
import { ImageCoverOdm } from "#modules/image-covers/repositories/odm";

export function docOdmToEntity(docOdm: FullDocOdm): SerieEntity {
  const ret = {
    id: docOdm._id.toString(),
    key: docOdm.key,
    name: docOdm.name,
    imageCoverId: docOdm.imageCoverId?.toString() ?? null,
    imageCover: docOdm.imageCover ? ImageCoverOdm.toEntity(docOdm.imageCover) : undefined,
  } satisfies SerieEntity;

  return removeUndefinedDeep(ret);
}

export function modelToDocOdm(model: Serie): DocOdm {
  return {
    key: model.key,
    name: model.name,
    imageCoverId: model.imageCoverId ? new Types.ObjectId(model.imageCoverId) : null,
  } satisfies DocOdm;
}

export function entityToDocOdm(entity: SerieEntity): FullDocOdm {
  return {
    _id: new Types.ObjectId(entity.id),
    ...modelToDocOdm(entity),
  } satisfies FullDocOdm;
}
