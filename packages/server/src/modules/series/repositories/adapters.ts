import { Serie } from "../models";
import { DocOdm } from "./odm";

export function docOdmToModel(serieDocOdm: DocOdm): Serie {
  return {
    id: serieDocOdm.id,
    name: serieDocOdm.name,
  };
}

export function modelToDocOdm(model: Serie): DocOdm {
  return {
    id: model.id,
    name: model.name,
  };
}
