import { Types } from "mongoose";
import { MusicUserInfoEntity } from "$shared/models/musics";
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
