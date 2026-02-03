import { Types } from "mongoose";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { MongoUpdateQuery } from "#utils/layers/db/mongoose";
import { ImageCoverOdm } from "#modules/image-covers/crud/repositories/odm";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { MusicSmartPlaylistModel,
  MusicSmartPlaylistEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";

export function modelToDocOdm(model: MusicSmartPlaylistModel): DocOdm {
  const doc: DocOdm = {
    name: model.name,
    query: model.query,
    slug: model.slug,
    ownerUserId: new Types.ObjectId(model.ownerUserId),
    visibility: model.visibility,
    imageCoverId: model.imageCoverId
      ? new Types.ObjectId(model.imageCoverId)
      : null,
    createdAt: new Date(), // Se sobreescribe por mongoose timestamp
    updatedAt: new Date(),
  };

  return removeUndefinedDeep(doc);
}

export function docOdmToEntity(doc: FullDocOdm): MusicSmartPlaylistEntity {
  const entity: MusicSmartPlaylistEntity = {
    id: doc._id.toString(),
    name: doc.name,
    query: doc.query,
    slug: doc.slug,
    ownerUserId: doc.ownerUserId.toString(),
    ownerUser: doc.ownerUser ? UserOdm.toEntity(doc.ownerUser) : undefined,
    ownerUserPublic: doc.ownerUserPublic
      ? {
        slug: doc.ownerUserPublic.publicUsername,
        publicName: doc.ownerUserPublic.publicName,
      }
      : undefined,
    visibility: doc.visibility,
    imageCoverId: doc.imageCoverId?.toString() ?? null,
    imageCover: doc.imageCover
      ? ImageCoverOdm.toEntity(doc.imageCover)
      : undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };

  return removeUndefinedDeep(entity);
}

export function partialModelToUpdateQuery(
  model: Partial<MusicSmartPlaylistEntity>,
): MongoUpdateQuery<DocOdm> {
  const ret: MongoUpdateQuery<DocOdm> = {
    name: model.name,
    query: model.query,
    slug: model.slug,
    visibility: model.visibility,
  };

  if (model.imageCoverId !== undefined) {
    ret.imageCoverId = model.imageCoverId
      ? new Types.ObjectId(model.imageCoverId)
      : null;
  }

  return removeUndefinedDeep(ret);
}
