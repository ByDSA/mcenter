import { DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { docOdmToEntity,
  entityToDocOdm,
  modelToDocOdm,
  partialToDocOdm } from "./adapters";

export namespace UserPassOdm {

  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const toEntity = docOdmToEntity;
  export const toFullDoc = entityToDocOdm;
  export const partialToDoc = partialToDocOdm;
  export const toDoc = modelToDocOdm;
};
