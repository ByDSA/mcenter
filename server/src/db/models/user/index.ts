import { deleteAll } from "./delete";
import User from "./document";
import { findByName } from "./find";
import UserInterface from "./interface";
import UserModel from "./model";
import { compareHash, hash } from "./password";
import UserSchema, { SchemaObj as UserSchemaObj } from "./schema";

export {
  User, UserInterface, UserSchema, UserModel, UserSchemaObj,
  hash, compareHash,
  findByName as findUserByName,
  deleteAll as deleteAllUsers,
};
