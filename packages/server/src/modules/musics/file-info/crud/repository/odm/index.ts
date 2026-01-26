import { COLLECTION, DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { docOdmToEntity as docOdmToMusicFileInfoEntity,
  modelToDocOdm as musicFileInfoToDocOdm,
  partialModelToDocOdm as partialMusicFileInfoToDocOdm,
  entityToDocOdm as musicFileInfoEntityToDocOdm } from "./adapters";

export namespace MusicFileInfoOdm {
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export const toEntity = docOdmToMusicFileInfoEntity;
  export const toDoc = musicFileInfoToDocOdm;
  export const partialToDoc = partialMusicFileInfoToDocOdm;
  export const toFullDoc = musicFileInfoEntityToDocOdm;
  export const COLLECTION_NAME = COLLECTION;
}
