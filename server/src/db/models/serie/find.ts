import { generateCommonFindFunctions } from "../resource";
import Doc from "./document";
import Model from "./model";

const generatedFunctions = generateCommonFindFunctions<Doc, typeof Model>( {
  model: Model,
} );
const { findByUrl,
  findAll,
  findByPath } = generatedFunctions;

export {
  findByUrl,
  findAll,
  findByPath,
};
