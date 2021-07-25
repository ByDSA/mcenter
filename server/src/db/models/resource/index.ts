import { generateCommonFunctions as generateCommonFilesFunctions } from "./files";
import { generateCommonFunctions as generateCommonFindFunctions } from "./find";
import { LocalResourceInterface, MultimediaLocalResourceInterface, ResourceInterface } from "./interface";
import { LocalResourceSchemaObj, MultimediaLocalResourceSchemaObj, ResourceSchemaObj } from "./schema";
import { check } from "./testing";

export {
  ResourceSchemaObj as RESOURCE,
  LocalResourceSchemaObj as LOCAL_RESOURCE,
  MultimediaLocalResourceSchemaObj as MULTIMEDIA_LOCAL_RESOURCE,

  ResourceInterface as Resource,
  LocalResourceInterface as LocalResource,
  MultimediaLocalResourceInterface as MultimediaLocalResource,
  generateCommonFilesFunctions,
  generateCommonFindFunctions,
  check as checkResource,
};
