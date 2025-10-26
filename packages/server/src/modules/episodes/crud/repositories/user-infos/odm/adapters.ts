import { Types } from "mongoose";
import { EpisodeUserInfoEntity } from "$shared/models/episodes";
import { EpisodeUserInfo } from "../../../../models";
import { DocOdm, FullDocOdm } from "./odm";

export function docOdmToEntity(docOdm: FullDocOdm): EpisodeUserInfoEntity {
  return {
    ...docOdmToModel(docOdm),
    id: docOdm._id.toString(),
  };
}

export function docOdmToModel(docOdm: DocOdm): EpisodeUserInfo {
  return {
    lastTimePlayed: docOdm.lastTimePlayed,
    weight: docOdm.weight,
    tags: docOdm.tags,
    episodeId: docOdm.episodeId.toString(),
    userId: docOdm.userId.toString(),
    createdAt: docOdm.createdAt,
    updatedAt: docOdm.updatedAt,
  };
}

export function modelToDocOdm(model: EpisodeUserInfo): DocOdm {
  return {
    lastTimePlayed: model.lastTimePlayed,
    weight: model.weight,
    tags: model.tags,
    episodeId: new Types.ObjectId(model.episodeId),
    userId: new Types.ObjectId(model.userId),
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
