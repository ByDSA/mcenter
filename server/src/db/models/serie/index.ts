
import { createFromPath } from "./create";
import { deleteAll } from "./delete";
import Doc from "./document";
import { getFoldersIn } from "./files";
import { findAll, findByName, findByPath, findByUrl } from "./find";
import Interface from "./interface";
import Model from "./model";
import Schema from "./schema";
import { check } from "./testing";

export {
  Schema as SerieSchema,
  Model as SerieModel,
  Doc as Serie,
  Interface as SerieInterface,
  findByUrl as findSerieByUrl,
  findByPath as findSerieByPath,
  findByName as findSerieByName,
  findAll as findAllSeries,
  deleteAll as deleteAllSeries,
  createFromPath as createSerieFromPath,
  check as checkSerie,
  getFoldersIn as getFoldersInSerie,
};
