import { DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { docOdmToModel, modelToDocOdm, docOdmToEntity } from "./adapters";

export namespace UserRoleMapOdm {

  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const toModel = docOdmToModel;
  export const toEntity = docOdmToEntity;
  export const toDoc = modelToDocOdm;
};
