import { DocOdm,
  ModelOdm, FullDocOdm, schemaOdm, COLLECTION } from "./odm";
import { docOdmToEntity, entityToFullDocOdm,
  modelToDocOdm } from "./adapters";

export namespace EpisodeHistoryEntryOdm {
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export const toEntity = docOdmToEntity;
  export const toDoc = modelToDocOdm;
  export const toFullDoc = entityToFullDocOdm;
  export const COLLECTION_NAME = COLLECTION;
}
