/* eslint-disable import/prefer-default-export */
import { Serie } from "#modules/series";
import { deepFreeze } from "#shared/utils/objects";

export const SERIE_SIMPSONS: Serie = deepFreeze( {
  "id" : "simpsons",
  "name" : "simpsons",
},
);