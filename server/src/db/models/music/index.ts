import { createFromPath } from "./create";
import { deleteAll } from "./delete";
import Music from "./document";
import { calcHashFile, findFiles, findFilesAt, getFullPath, getRelativePath } from "./files";
import { findAll, findByHash, findByPath, findByUrl } from "./find";
import MusicInterface from "./interface";
import MusicModel from "./model";
import MusicSchema from "./schema";
import { check } from "./testing";

export {
  MusicSchema,
  MusicModel,
  Music,
  MusicInterface,
  findByHash as findMusicByHash,
  findByUrl as findMusicByUrl,
  findByPath as findMusicByPath,
  findAll as findAllMusics,
  createFromPath as createMusicFromPath,
  deleteAll as deleteAllMusics,
  getFullPath as getMusicFullPath,
  getRelativePath as getMusicRelativePath,
  calcHashFile as calcMusicHashFile,
  findFiles as findMusicFiles,
  findFilesAt as findMusicFilesAt,
  check as checkMusic,
};
