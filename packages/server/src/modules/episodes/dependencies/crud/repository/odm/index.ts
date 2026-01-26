import { DocOdm,
  ModelOdm, FullDocOdm, schemaOdm,
  COLLECTION } from "./odm";
import { docOdmToEntity, entityToFullDocOdm,
  modelToDocOdm } from "./adapters";

export namespace EpisodeDependencyOdm {
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;

  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export const toEntity = docOdmToEntity;
  export const toDoc = modelToDocOdm;
  export const toFullDoc = entityToFullDocOdm;
  export const COLLECTION_NAME = COLLECTION;
}
