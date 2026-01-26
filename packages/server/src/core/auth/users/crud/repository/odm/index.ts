import { COLLECTION, DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { docOdmToEntity,
  musicEntityToDocOdm,
  modelToDocOdm,
  partialToDocOdm } from "./adapters";

export namespace UserOdm {

  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const toEntity = docOdmToEntity;
  export const toFullDoc = musicEntityToDocOdm;
  export const partialToDoc = partialToDocOdm;
  export const toDoc = modelToDocOdm;
  export const COLLECTION_NAME = COLLECTION;
};
