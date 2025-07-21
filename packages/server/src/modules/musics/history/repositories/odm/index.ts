/* eslint-disable @typescript-eslint/naming-convention */
import { DocOdm, FullDocOdm, ModelOdm, schemaOdm } from "./odm";
import { docOdmToEntity, docOdmToModel, modelToDocOdm } from "./adapters";

export namespace MusicHistoryEntryOdm {
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export const toEntity = docOdmToEntity;
  export const toModel = docOdmToModel;
  export const toDoc = modelToDocOdm;
}
