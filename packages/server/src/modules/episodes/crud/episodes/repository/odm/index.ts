import { DocOdm, ModelOdm, schemaOdm,
  FullDocOdm,
  COLLECTION } from "./odm";
import { docOdmToEntity, docOdmToModel, entityToDocOdm, episodeToDocOdm, toUpdateQuery as _toUpdateQuery } from "./adapters";

export namespace EpisodeOdm {
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export const toEntity = docOdmToEntity;
  export const toModel = docOdmToModel;
  export const toFullDoc = entityToDocOdm;
  export const toDoc = episodeToDocOdm;
  export const toUpdateQuery = _toUpdateQuery;
  export const COLLECTION_NAME = COLLECTION;
}
