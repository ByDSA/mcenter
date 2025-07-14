import { deepFreeze } from "$shared/utils/objects";
import { SerieEntity } from "$shared/models/series";

export const SERIE_SIMPSONS: SerieEntity = deepFreeze( {
  id: "simpsons",
  name: "simpsons",
} );
