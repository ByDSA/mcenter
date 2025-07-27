import { deepFreeze } from "$shared/utils/objects";
import { SerieEntity } from "$shared/models/series";
import { Types } from "mongoose";

export const SERIE_SIMPSONS: SerieEntity = deepFreeze( {
  id: new Types.ObjectId().toString(),
  key: "simpsons",
  name: "simpsons",
} );
