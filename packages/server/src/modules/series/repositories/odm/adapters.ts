import { Types } from "mongoose";
import { Serie, SerieEntity } from "../../models";
import { DocOdm, FullDocOdm } from "./odm";

export function docOdmToEntity(docOdm: FullDocOdm): SerieEntity {
  return {
    id: docOdm._id.toString(),
    key: docOdm.key,
    name: docOdm.name,
  };
}

export function modelToDocOdm(model: Serie): DocOdm {
  return {
    key: model.key,
    name: model.name,
  } satisfies DocOdm;
}

export function entityToDocOdm(entity: SerieEntity): FullDocOdm {
  return {
    _id: new Types.ObjectId(entity.id),
    ...modelToDocOdm(entity),
  } satisfies FullDocOdm;
}
