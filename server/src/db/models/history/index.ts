import { deleteAllInUser } from "./delete";
import { findInUserByName } from "./find";
import Interface from "./interface";
import Schema, { SchemaObj } from "./schema";
import { check } from "./testing";

export {
  Interface as HistoryInterface,
  Schema as HistorySchema,
  SchemaObj as HistorySchemaObj,
  findInUserByName as findHistoryInUserByName,
  deleteAllInUser as deleteAllHistoriesInUser,
  check as checkHistory,
};
