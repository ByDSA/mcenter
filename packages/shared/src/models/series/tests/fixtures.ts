import type { SerieEntity } from "..";
import { ObjectId } from "mongodb";
import { deepFreeze } from "../../../utils/objects";

export const SERIE_SIMPSONS: SerieEntity = deepFreeze( {
  id: new ObjectId().toString(),
  key: "simpsons",
  name: "simpsons",
  imageCoverId: null,
} );
