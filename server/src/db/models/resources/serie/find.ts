import { Schema } from "mongoose";
import { generateCommonFindFunctions } from "../genFuncs";
import Doc from "./document";
import Interface from "./interface";
import Model from "./model";

const generatedFunctions = generateCommonFindFunctions<Doc, typeof Model>( {
  model: Model,
} );
const { findByUrl,
  findAll,
  findByName,
  findByPath } = generatedFunctions;

export {
  findByUrl,
  findAll,
  findByPath,
  findByName,
};

type Params = {serie: Interface, id: Schema.Types.ObjectId};
export function getEpisodeById( { serie, id }: Params) {
  for (const e of serie.episodes) {
    // eslint-disable-next-line no-underscore-dangle
    if (e._id === id)
      return e;
  }

  return null;
}
