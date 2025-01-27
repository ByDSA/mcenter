export {
  Serie,
  SerieId,
  SerieSchema,
} from "./models";

export {
  DocOdm as SerieDocOdm,
  docOdmToModel as serieDocOdmToModel,
  ModelOdm as SerieModelOdm,
  SerieRepository,
  modelToDocOdm as serieToDocOdm,
} from "./repositories";
