import { generateCommonFindFunctions } from "../resource";
import Doc from "./document";
import Model from "./model";

const generatedFunctions = generateCommonFindFunctions<Doc, typeof Model>( {
  model: Model,
} );

export const { findByHash,
  findByUrl,
  findAll,
  findByPath } = generatedFunctions;
