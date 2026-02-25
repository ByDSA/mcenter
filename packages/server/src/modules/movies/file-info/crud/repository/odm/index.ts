import { COLLECTION, DocOdm,
  FullDocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { docOdmToEntity as docOdmToMovieFileInfoEntity,
  partialModelToDocOdm as partialMovieFileInfoToDocOdm,
  entityToDocOdm as movieFileInfoEntityToDocOdm } from "./adapters";

export namespace MovieFileInfoOdm {
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export const toEntity = docOdmToMovieFileInfoEntity;
  export const partialToDoc = partialMovieFileInfoToDocOdm;
  export const toFullDoc = movieFileInfoEntityToDocOdm;
  export const COLLECTION_NAME = COLLECTION;
}
