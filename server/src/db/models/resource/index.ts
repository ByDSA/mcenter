import { generateCommonFunctions as generateCommonFilesFunctions } from "./files";
import { findFromItem, generateCommonFunctions as generateCommonFindFunctions, TypeResource } from "./find";
import { LocalResourceInterface, MultimediaLocalResourceInterface, ResourceInterface } from "./interface";
import { LocalResourceSchemaObj, MultimediaLocalResourceSchemaObj, ResourceSchemaObj } from "./schema";
import { check, checkLocal, checkLocalFile } from "./testing";

export {
  ResourceSchemaObj as RESOURCE,
  LocalResourceSchemaObj as LOCAL_RESOURCE,
  MultimediaLocalResourceSchemaObj as MULTIMEDIA_LOCAL_RESOURCE,

  ResourceInterface,
  LocalResourceInterface,
  MultimediaLocalResourceInterface,
  generateCommonFilesFunctions,
  generateCommonFindFunctions,
  check as checkResource,
  checkLocal as checkLocalResource,
  checkLocalFile as checkLocalFileResource,
  TypeResource,
  findFromItem as findResourceFromItem,
};
