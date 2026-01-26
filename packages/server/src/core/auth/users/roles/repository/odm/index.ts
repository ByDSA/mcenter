import { DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { docOdmToEntity,
  musicEntityToDocOdm,
  modelToDocOdm } from "./adapters";

export namespace UserRoleOdm {

  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const toEntity = docOdmToEntity;
  export const toFullDoc = musicEntityToDocOdm;
  export const toDoc = modelToDocOdm;
};
