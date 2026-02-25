import { MovieEntity } from "$shared/models/movies";
import mongoose, { Types } from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { ImageCoverOdm } from "#modules/image-covers/crud/repositories/odm";
import { DocOdm, FullDocOdm } from "./odm";
import { MovieFileInfoOdm } from "#modules/movies/file-info/crud/repository/odm";

export function toEntity(doc: FullDocOdm): MovieEntity {
  const entity: MovieEntity = {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    year: doc.year,
    genre: doc.genre,
    director: doc.director,
    synopsis: doc.synopsis,
    duration: doc.duration,
    imageCoverId: doc.imageCoverId?.toString(),
    imageCover: doc.imageCover ? ImageCoverOdm.toEntity(doc.imageCover) : undefined,
    uploaderUserId: doc.uploaderUserId.toString(),
    disabled: doc.disabled,
    tags: doc.tags,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    addedAt: doc.addedAt,
    releasedOn: doc.releasedOn,
    fileInfos: doc.fileInfos ? doc.fileInfos.map(MovieFileInfoOdm.toEntity) : undefined,
  } satisfies AllKeysOf<MovieEntity>;

  return removeUndefinedDeep(entity);
}

export function toFullDoc(model: MovieEntity): FullDocOdm {
  const doc: FullDocOdm = {
    _id: new mongoose.Types.ObjectId(model.id),
    title: model.title,
    slug: model.slug,
    year: model.year,
    genre: model.genre,
    director: model.director,
    synopsis: model.synopsis,
    duration: model.duration,
    imageCoverId: model.imageCoverId ? new Types.ObjectId(model.imageCoverId) : undefined,
    uploaderUserId: new Types.ObjectId(model.uploaderUserId),
    disabled: model.disabled,
    tags: model.tags,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
    addedAt: model.addedAt,
    releasedOn: model.releasedOn,
  } satisfies AllKeysOf<DocOdm>;

  return removeUndefinedDeep(doc);
}

export function partialToDoc(partial: Partial<MovieEntity>): Partial<DocOdm> {
  const ret: Partial<DocOdm> = {
    title: partial.title,
    slug: partial.slug,
    year: partial.year,
    genre: partial.genre,
    director: partial.director,
    synopsis: partial.synopsis,
    duration: partial.duration,
    imageCoverId: partial.imageCoverId ? new Types.ObjectId(partial.imageCoverId) : undefined,
    uploaderUserId: partial.uploaderUserId ? new Types.ObjectId(partial.uploaderUserId) : undefined,
    disabled: partial.disabled,
    tags: partial.tags,
    createdAt: partial.createdAt,
    updatedAt: partial.updatedAt,
    addedAt: partial.addedAt,
    releasedOn: partial.releasedOn,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return ret;
}
