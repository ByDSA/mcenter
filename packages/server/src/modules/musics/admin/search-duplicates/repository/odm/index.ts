/* eslint-disable @typescript-eslint/naming-convention */
import { COLLECTION, DocOdm,
  ModelOdm,
  schemaOdm } from "./odm";
import { docOdmsToModels } from "./adapters";

export namespace MusicDuplicatesIgnoreGroupsOdm {
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export type Doc = DocOdm;
  export const toModels = docOdmsToModels;
  export const COLLECTION_NAME = COLLECTION;
};
