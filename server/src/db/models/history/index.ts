import { deleteAllInUser } from "./delete";
import { findByNameAndUsername, getLastItem } from "./find";
import Interface from "./interface";
import Schema, { SchemaObj } from "./schema";
import { check } from "./testing";

export {
  Interface as HistoryInterface,
  Schema as HistorySchema,
  SchemaObj as HistorySchemaObj,
  findByNameAndUsername as findHistoryByNameAndUsername,
  deleteAllInUser as deleteAllHistoriesInUser,
  check as checkHistory,
  getLastItem as getLastItemFromHistory,
};
