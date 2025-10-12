/* eslint-disable @typescript-eslint/naming-convention */
import { COLLECTION, DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { musicDocOdmToEntity,
  musicEntityToDocOdm,
  musicToDocOdm, partialToDocOdm,
  aggregationResultToResponse as _aggregationResultToResponse } from "./adapters";
import { getCriteriaPipeline as _getCriteriaPipeline } from "./criteria-pipeline";

export namespace MusicOdm {
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const toEntity = musicDocOdmToEntity;
  export const toFullDoc = musicEntityToDocOdm;
  export const toDoc = musicToDocOdm;
  export const getCriteriaPipeline = _getCriteriaPipeline;
  export const partialToDoc = partialToDocOdm;
  export const toPaginatedResult = _aggregationResultToResponse;
  export const COLLECTION_NAME = COLLECTION;
};
