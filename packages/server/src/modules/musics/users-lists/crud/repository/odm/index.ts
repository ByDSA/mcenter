import { COLLECTION, DocOdm, FullDocOdm, ModelOdm, schemaOdm } from "./odm";
import { docOdmToEntity, modelToDocOdm } from "./adapters";

export namespace MusicUserListOdm {

  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;

  export const toEntity = docOdmToEntity;
  export const toDoc = modelToDocOdm;
  export const COLLECTION_NAME = COLLECTION;
}
