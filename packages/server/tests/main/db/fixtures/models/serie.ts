import { deepFreeze } from "$shared/utils/objects";
import { SerieEntity } from "$sharedSrc/models/series";

export const SERIE_SIMPSONS: SerieEntity = deepFreeze( {
  id: "simpsons",
  name: "simpsons",
} );
