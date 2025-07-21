/* eslint-disable @typescript-eslint/naming-convention */
import { DocOdm,
  ModelOdm,
  schema as _schema } from "./odm";
import { streamDocOdmToModel,
  streamToDocOdm } from "./adapters";

export namespace StreamOdm {
  export const toModel = streamDocOdmToModel;
  export const toDoc = streamToDocOdm;
  export type Doc = DocOdm;
  export const Model = ModelOdm;
  export const schema = _schema;
}
