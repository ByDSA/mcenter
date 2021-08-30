
import { createFromPath } from "./create";
import { deleteAll } from "./delete";
import Doc from "./document";
import { getEpisodeFullPath, getFoldersIn, getFullPath } from "./files";
import { findAll, findById, findByName, findByPath, findByUrl, findEpisodeByUrl, getEpisodeById, getEpisodeByUrl } from "./find";
import Interface, { Episode } from "./interface";
import Model from "./model";
import Schema from "./schema";
import { check, checkEpisode } from "./testing";

export {
  Schema as SerieSchema,
  Model as SerieModel,
  Doc as Serie,
  Interface as SerieInterface,
  Episode,
  findById as findSerieById,
  findByUrl as findSerieByUrl,
  findByPath as findSerieByPath,
  findByName as findSerieByName,
  findEpisodeByUrl,
  findAll as findAllSeries,
  deleteAll as deleteAllSeries,
  createFromPath as createSerieFromPath,
  check as checkSerie,
  checkEpisode,
  getFoldersIn as getFoldersInSerie,
  getEpisodeById,
  getEpisodeByUrl,
  getFullPath as getFullPathSerie,
  getEpisodeFullPath,
};
