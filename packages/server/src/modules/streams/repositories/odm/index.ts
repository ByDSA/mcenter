/* eslint-disable @typescript-eslint/naming-convention */
import { DocOdm,
  FullDocOdm,
  ModelOdm,
  schema as _schema } from "./odm";
import { streamDocOdmToEntity, streamDocOdmToModel, entityToFullDoc,
  streamToDocOdm } from "./adapters";

export namespace StreamOdm {
  export const toModel = streamDocOdmToModel;
  export const toEntity = streamDocOdmToEntity;
  export const toDoc = streamToDocOdm;
  export const toFullDoc = entityToFullDoc;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const Model = ModelOdm;
  export const schema = _schema;
}
