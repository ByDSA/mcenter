import { COLLECTION, DocOdm,
  FullDocOdm,
  ModelOdm,
  schema as schemaOdm } from "./odm";
import { docOdmToEntity,
  entityToDocOdm,
  modelToDocOdm } from "./adapters";

export namespace SeriesOdm {
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;

  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export const toEntity = docOdmToEntity;
  export const toFullDoc = entityToDocOdm;
  export const toDoc = modelToDocOdm;
  export const COLLECTION_NAME = COLLECTION;
}
