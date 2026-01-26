import { DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { fullDocOdmToEntity,
  entityToDocOdm,
  modelToDocOdm, partialToDocOdm } from "./adapters";

export namespace RemotePlayerOdm {
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const toEntity = fullDocOdmToEntity;
  export const toFullDoc = entityToDocOdm;
  export const toDoc = modelToDocOdm;
  export const partialToDoc = partialToDocOdm;

};
