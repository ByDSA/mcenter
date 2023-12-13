import { createFromPath, createFromPathAndSave } from "./music.create";
import { deleteAll } from "./music.delete";
import Music from "./music.document";
import { findAll, findByHash, findByPath, findByUrl } from "./music.find";
import MusicModel from "./music.model";
import MusicSchema from "./music.schema";

export {
  Music, MusicModel, MusicSchema, createFromPath,
  createFromPathAndSave,
  deleteAll, findAll, findByHash, findByPath, findByUrl,
};
