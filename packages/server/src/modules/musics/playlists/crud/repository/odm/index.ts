import { COLLECTION, DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { fullDocOdmToEntity,
  entityToFullDocOdm,
  modelToDocOdm, partialModelToUpdateQuery,
  entryModelToDocOdm,
  entryDocOdmToModel } from "./adapters";
import { getCriteriaPipeline as _getCriteriaPipeline } from "./criteria-pipeline";

export namespace MusicPlaylistOdm {
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;

  export const entryToDoc = entryModelToDocOdm;
  export const entryDocToModel = entryDocOdmToModel;
  export const toEntity = fullDocOdmToEntity;
  export const toFullDoc = entityToFullDocOdm;
  export const toDoc = modelToDocOdm;
  export const partialToUpdateQuery = partialModelToUpdateQuery;
  export const getCriteriaPipeline = _getCriteriaPipeline;
  export const COLLECTION_NAME = COLLECTION;
};
