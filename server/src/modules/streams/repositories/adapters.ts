import { Model } from "../models";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Model {
  return {
    id: docOdm.id,
    group: docOdm.group,
    mode: docOdm.mode,
  };
}

export function modelToDocOdm(model: Model): DocOdm {
  return {
    id: model.id,
    group: model.group,
    mode: model.mode,
  };
}