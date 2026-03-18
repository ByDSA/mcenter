import { Types, UpdateQuery } from "mongoose";
import { MusicUserInfoEntity } from "$shared/models/musics";
import { MusicInfoCrudDtos } from "$shared/models/musics/user-info/dto/transport";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { AllKeysOf } from "$shared/utils/types";
import { MusicUserInfo } from "../../../../models";
import { DocOdm, FullDocOdm } from "./odm";

export function docOdmToEntity(docOdm: FullDocOdm): MusicUserInfoEntity {
  return {
    ...docOdmToModel(docOdm),
    id: docOdm._id.toString(),
  };
}

export function docOdmToModel(docOdm: DocOdm): MusicUserInfo {
  return {
    lastTimePlayed: docOdm.lastTimePlayed,
    weight: docOdm.weight,
    tags: docOdm.tags,
    musicId: docOdm.musicId.toString(),
    userId: docOdm.userId.toString(),
    createdAt: docOdm.createdAt,
    updatedAt: docOdm.updatedAt,
  };
}

export function modelToDocOdm(model: MusicUserInfo): DocOdm {
  return {
    lastTimePlayed: model.lastTimePlayed,
    weight: model.weight,
    tags: model.tags,
    musicId: new Types.ObjectId(model.musicId),
    userId: new Types.ObjectId(model.userId),
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export function toUpdateQuery(dto: MusicInfoCrudDtos.Patch.Body): UpdateQuery<DocOdm> {
  const { entity } = dto;
  let $set: NonNullable<UpdateQuery<DocOdm>["$set"]> = {
    lastTimePlayed: entity.lastTimePlayed,
    weight: entity.weight,
  } satisfies AllKeysOf<Omit<DocOdm, "_id" | "createdAt" | "musicId" | "tags" | "updatedAt" |
    "userId">>;
  const updateQuery: UpdateQuery<DocOdm> = {};

  if (entity.tags) {
    const { push, pull, replace } = entity.tags;

    if (entity.tags?.replace) {
      if (replace?.length === 0) {
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

  updateQuery.$set = $set;

  return updateQuery;
}
