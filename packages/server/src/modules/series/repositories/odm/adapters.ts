import { Types } from "mongoose";
import { Serie, SerieEntity } from "../../models";
import { DocOdm, FullDocOdm } from "./odm";

export function docOdmToEntity(docOdm: FullDocOdm): SerieEntity {
  return {
    _id: docOdm._id.toString(),
    key: docOdm.id,
    name: docOdm.name,
  };
}

export function modelToDocOdm(model: Serie): DocOdm {
  return {
    id: model.key,
    name: model.name,
  };
}

export function entityToDocOdm(entity: SerieEntity): FullDocOdm {
  return {
    _id: new Types.ObjectId(entity._id),
    id: entity.key,
    name: entity.name,
  };
}
