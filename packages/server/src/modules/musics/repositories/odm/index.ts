/* eslint-disable @typescript-eslint/naming-convention */
import { DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { musicDocOdmToEntity,
  musicEntityToDocOdm,
  musicToDocOdm } from "./adapters";

export namespace MusicOdm {
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const toEntity = musicDocOdmToEntity;
  export const entityToDocOdm = musicEntityToDocOdm;
  export const toDocOdm = musicToDocOdm;
};
