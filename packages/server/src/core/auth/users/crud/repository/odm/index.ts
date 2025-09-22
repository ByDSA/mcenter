import { DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { docOdmToEntity,
  musicEntityToDocOdm,
  modelToDocOdm,
  partialToDocOdm } from "./adapters";

export namespace UserOdm {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const toEntity = docOdmToEntity;
  export const toFullDoc = musicEntityToDocOdm;
  export const partialToDoc = partialToDocOdm;
  export const toDoc = modelToDocOdm;
};
