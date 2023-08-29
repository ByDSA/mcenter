/* eslint-disable import/prefer-default-export */
import { Model } from "../models";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Model {
  return {
    ...docOdm,
  };
}

export function modelToDocOdm(model: Model): DocOdm {
  return {
    ...model,
  };
}