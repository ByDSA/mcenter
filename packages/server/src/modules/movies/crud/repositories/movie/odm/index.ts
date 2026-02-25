import { DocOdm, FullDocOdm, ModelOdm, schemaOdm } from "./odm";
import { toEntity as _toEntity, toFullDoc as _toFullDoc, partialToDoc as _partialToDoc } from "./adapters";

export namespace MovieOdm {
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const toEntity = _toEntity;
  export const toFullDoc = _toFullDoc;
  export const partialToDoc = _partialToDoc;
};
