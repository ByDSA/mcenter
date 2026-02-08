import type { SeriesEntity } from "..";
import { ObjectId } from "mongodb";
import { fixtureImageCovers } from "../../../image-covers/tests";
import { deepFreeze } from "../../../../utils/objects";

export const SERIES_SIMPSONS: SeriesEntity = deepFreeze( {
  id: new ObjectId().toString(),
  key: "simpsons",
  name: "simpsons",
  imageCoverId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  addedAt: new Date(),
} );

export const SERIES_SAMPLE_SERIES: SeriesEntity = deepFreeze( {
  id: new ObjectId().toString(),
  key: "sample-serie",
  name: "Sample Series",
  imageCoverId: fixtureImageCovers.Disk.Samples.NodeJs.id,
  createdAt: new Date(),
  updatedAt: new Date(),
  addedAt: new Date(),
} );
