import { SerieEntity } from "../models";
import { DocOdm } from "./odm";

export function docOdmToEntity(serieDocOdm: DocOdm): SerieEntity {
  return {
    id: serieDocOdm.id,
    name: serieDocOdm.name,
  };
}

export function entityToDocOdm(entity: SerieEntity): DocOdm {
  return {
    id: entity.id,
    name: entity.name,
  };
}
