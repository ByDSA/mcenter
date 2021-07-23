import { createFromPath, createFromPathAndSave } from "./create";
import { deleteAll } from "./delete";
import Music from "./document";
import { findAll, findByHash, findByPath, findByUrl } from "./find";
import MusicModel from "./model";
import MusicSchema from "./schema";

export {
  MusicSchema,
  MusicModel,
  Music,
  findByHash,
  findByUrl,
  findByPath,
  findAll,
  createFromPath,
  createFromPathAndSave,
  deleteAll,
};
