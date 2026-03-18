import { COLLECTION, DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { docOdmToEntity, docOdmToModel,
  modelToDocOdm,
  toUpdateQuery as _toUpdateQuery } from "./adapters";

export namespace MusicsUsersOdm {
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const toEntity = docOdmToEntity;
  export const toModel = docOdmToModel;
  export const toDoc = modelToDocOdm;
  export const COLLECTION_NAME = COLLECTION;
  export const toUpdateQuery = _toUpdateQuery;
};
