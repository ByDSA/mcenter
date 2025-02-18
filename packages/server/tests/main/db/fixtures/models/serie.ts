import { deepFreeze } from "#shared/utils/objects";
import { Serie } from "#modules/series";

export const SERIE_SIMPSONS: Serie = deepFreeze( {
  id: "simpsons",
  name: "simpsons",
} );
