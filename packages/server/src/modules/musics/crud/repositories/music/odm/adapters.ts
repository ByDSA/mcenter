import mongoose, { Types, UpdateQuery } from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { PaginatedResult } from "$shared/utils/http/responses";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { MusicFileInfoOdm } from "#musics/file-info/crud/repository/odm";
import { MusicsUsersOdm } from "#musics/crud/repositories/user-info/odm";
import { ImageCoverOdm } from "#modules/image-covers/crud/repositories/odm";
import { Music, MusicEntity } from "../../../../models";
import { DocOdm, FullDocOdm } from "./odm";

export type AggregationResult = {
  data: FullDocOdm[];
  metadata: {
    totalCount?: number;
  }[];
}[];

type Model = Music;
type Entity = MusicEntity;

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const entity: Entity = {
    id: docOdm._id.toString(),
    title: docOdm.title,
    slug: docOdm.url,
    artist: docOdm.artist,
    tags: docOdm.tags,
    disabled: docOdm.disabled,
    uploaderUserId: docOdm.uploaderUserId.toString(),
    album: docOdm.album,
    country: docOdm.country,
    game: docOdm.game,
    year: docOdm.year,
    spotifyId: docOdm.spotifyId,
    createdAt: docOdm.createdAt,
    updatedAt: docOdm.updatedAt,
    addedAt: docOdm.addedAt,
    releasedOn: docOdm.releasedOn,
    fileInfos: docOdm.fileInfos?.map(MusicFileInfoOdm.toEntity),
    userInfo: docOdm.userInfo ? MusicsUsersOdm.toEntity(docOdm.userInfo) : undefined,
    isFav: docOdm.isFav,
    imageCoverId: docOdm.imageCoverId?.toString(),
    imageCover: docOdm.imageCover ? ImageCoverOdm.toEntity(docOdm.imageCover) : undefined,
    offloaded: docOdm.offloaded,
  } satisfies AllKeysOf<Entity>;

  return removeUndefinedDeep(entity);
}

export function modelToDocOdm(model: Model): DocOdm {
  const docOdm: DocOdm = {
    title: model.title,
    url: model.slug,
    artist: model.artist,
    uploaderUserId: new Types.ObjectId(model.uploaderUserId),
    disabled: model.disabled,
    album: model.album,
    country: model.country,
    game: model.game,
    year: model.year,
    spotifyId: model.spotifyId,
    tags: model.tags,
    addedAt: model.addedAt,
    createdAt: model.createdAt,
    releasedOn: model.releasedOn,
    updatedAt: model.updatedAt,
    imageCoverId: model.imageCoverId ? new Types.ObjectId(model.imageCoverId) : undefined,
  } satisfies AllKeysOf<Omit<DocOdm, "_id" | "offloaded">>;

  return removeUndefinedDeep(docOdm);
}

export function musicEntityToDocOdm(entity: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entity),
    _id: new mongoose.Types.ObjectId(entity.id),
  };
}

export function toUpdateQuery(dto: MusicCrudDtos.Patch.Body): UpdateQuery<DocOdm> {
  const updateQuery: UpdateQuery<DocOdm> = {};
  const dtoEntity = dto.entity;
  let $set: NonNullable<UpdateQuery<DocOdm>["$set"]> = {
    title: dtoEntity.title,
    url: dtoEntity.slug,
    artist: dtoEntity.artist,
    disabled: dtoEntity.disabled,
    album: dtoEntity.album,
    country: dtoEntity.country,
    game: dtoEntity.game,
    year: dtoEntity.year,
    spotifyId: dtoEntity.spotifyId,
    releasedOn: dtoEntity.releasedOn,
    imageCoverId: dtoEntity.imageCoverId ? new Types.ObjectId(dtoEntity.imageCoverId) : undefined,
  } satisfies AllKeysOf<Omit<DocOdm, "_id" | "addedAt" | "createdAt" | "offloaded" | "tags" |
    "updatedAt" | "uploaderUserId">>;

  if (dtoEntity.tags) {
    const { push, pull, replace } = dtoEntity.tags;

    if (replace) {
      if (replace.length === 0) {
        updateQuery.$unset = {
          ...updateQuery.$unset,
          tags: true,
        };
      } else
        $set.tags = replace;
    } else {
      if (push?.length) {
        updateQuery.$push = {
          ...updateQuery.$push,
          tags: {
            $each: push,
          },
        };
      }

      if (pull?.length) {
        updateQuery.$pull = {
          ...updateQuery.$pull,
          tags: {
            $in: pull,
          },
        };
      }
    }
  }

  $set = removeUndefinedDeep($set);

  if (Object.keys($set).length > 0)
    updateQuery.$set = $set;

  if (dto.unset?.length) {
    updateQuery.$unset = {
      ...updateQuery.$unset,
      ...dto.unset.reduce(
        (acc, path) => {
          acc[path.join(".")] = 1;

          return acc;
        },
         {} as Record<string, 1>,
      ),
    };
  }

  return updateQuery;
}

export function aggregationResultToResponse(
  aggregationResult: AggregationResult,
): PaginatedResult<Entity> {
  const result = aggregationResult[0] ?? [];
  const data = result.data.map(docOdmToEntity);
  const metadata: PaginatedResult<Entity>["metadata"] = {};
  const totalCount = result.metadata[0]?.totalCount;

  if (totalCount !== undefined)
    metadata.totalCount = totalCount;

  return {
    data,
    metadata,
  };
}
