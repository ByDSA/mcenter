/* eslint-disable @typescript-eslint/naming-convention */
import { DocOdm, ModelOdm, schemaOdm,
  FullDocOdm, getIdOdmFromCompKey, EpisodeCompKeyOdm } from "./odm";
import { docOdmToEntity, docOdmToModel, entityToDocOdm, episodeToDocOdm, partialModelToDocOdm } from "./adapters";

export namespace EpisodeOdm {
  export type Doc = DocOdm;
  export type FullDoc = FullDocOdm;
  export const Model = ModelOdm;
  export const schema = schemaOdm;
  export const getIdFromCompKey = getIdOdmFromCompKey;
  export const toEntity = docOdmToEntity;
  export const toModel = docOdmToModel;
  export const toFullDoc = entityToDocOdm;
  export const toDoc = episodeToDocOdm;
  export const partialToDoc = partialModelToDocOdm;
  export type EpisodeCompKey = EpisodeCompKeyOdm;
}
