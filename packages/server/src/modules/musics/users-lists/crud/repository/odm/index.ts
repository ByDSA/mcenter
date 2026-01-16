import { COLLECTION, DocOdm, FullDocOdm, ModelOdm, schemaOdm } from "./odm";
import { docOdmToEntity, modelToDocOdm } from "./adapters";

export namespace MusicUserListOdm {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;

  export const toEntity = docOdmToEntity;
  export const toDoc = modelToDocOdm;
  export const COLLECTION_NAME = COLLECTION;
}
