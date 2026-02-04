import type { SeriesEntity } from "..";
import { ObjectId } from "mongodb";
import { deepFreeze } from "../../../../utils/objects";

export const SERIE_SIMPSONS: SeriesEntity = deepFreeze( {
  id: new ObjectId().toString(),
  key: "simpsons",
  name: "simpsons",
  imageCoverId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  addedAt: new Date(),
} );

export const SAMPLE_SERIE: SeriesEntity = deepFreeze( {
  id: new ObjectId().toString(),
  key: "sample-serie",
  name: "Sample Serie",
  imageCoverId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  addedAt: new Date(),
} );
