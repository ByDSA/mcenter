/* eslint-disable @typescript-eslint/naming-convention */
import { DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { docOdmToEntity,
  modelToDocOdm,
  partialModelToDocOdm,
  entityToDocOdm } from "./adapters";

export namespace EpisodeFileInfoOdm {
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export const docToEntity = docOdmToEntity;
  export const toDoc = modelToDocOdm;
  export const entityToDoc = entityToDocOdm;
  export const partialToDoc = partialModelToDocOdm;
}
