import { Types } from "mongoose";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { AllKeysOf } from "$shared/utils/types";
import { ImageCoverOdm } from "#modules/image-covers/repositories/odm";
import { MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { Series, SeriesEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";

type Model = Series;
type Entity = SeriesEntity;

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const ret = {
    id: docOdm._id.toString(),
    key: docOdm.key,
    name: docOdm.name,
    imageCoverId: docOdm.imageCoverId?.toString() ?? null,
    imageCover: docOdm.imageCover ? ImageCoverOdm.toEntity(docOdm.imageCover) : undefined,
    countEpisodes: docOdm.countEpisodes,
    countSeasons: docOdm.countSeasons,
    addedAt: docOdm.addedAt,
    createdAt: docOdm.createdAt,
    updatedAt: docOdm.updatedAt,
    releasedOn: docOdm.releasedOn,
  } satisfies AllKeysOf<Entity>;

  return removeUndefinedDeep(ret);
}

export function modelToDocOdm(model: Model): DocOdm {
  return {
    key: model.key,
    name: model.name,
    imageCoverId: model.imageCoverId ? new Types.ObjectId(model.imageCoverId) : null,
    addedAt: model.addedAt,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    releasedOn: model.releasedOn,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;
}

export function entityToDocOdm(entity: Entity): FullDocOdm {
  return {
    _id: new Types.ObjectId(entity.id),
    ...modelToDocOdm(entity),
    releasedOn: entity.releasedOn,
  } satisfies AllKeysOf<DocOdm>;
}

export function partialToDocOdm(model: Partial<Model>): MongoUpdateQuery<DocOdm> {
  let imageCoverId: Types.ObjectId | null | undefined;

  if (model.imageCoverId !== undefined)
    imageCoverId = model.imageCoverId ? new Types.ObjectId(model.imageCoverId) : null;
  else
    imageCoverId = undefined;

  const docOdm: Partial<DocOdm> = {
    key: model.key,
    name: model.name,
    imageCoverId,
    addedAt: model.addedAt,
    createdAt: undefined,
    updatedAt: model.updatedAt,
    releasedOn: model.releasedOn,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
}
