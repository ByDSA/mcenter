/* eslint-disable import/prefer-default-export */
import { Model } from "../models";
import { DocOdm } from "./odm";

export function docOdmToModel(serieDocOdm: DocOdm): Model {
  return {
    id: serieDocOdm.id,
    name: serieDocOdm.name,
  };
}

export function modelToDocOdm(model: Model): DocOdm {
  return {
    id: model.id,
    name: model.name,
  };
}