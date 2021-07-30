import { Schema } from "mongoose";
import { generateCommonFindFunctions } from "../genFuncs";
import Doc from "./document";
import Interface, { Episode } from "./interface";
import Model from "./model";

const generatedFunctions = generateCommonFindFunctions<Doc, typeof Model>( {
  model: Model,
} );
const { findByUrl,
  findAll,
  findByName,
  findById,
  findByPath } = generatedFunctions;

export {
  findById,
  findByUrl,
  findAll,
  findByPath,
  findByName,
};

type Params = {serie: Interface, id: Schema.Types.ObjectId};
export function getEpisodeById( { serie, id }: Params) {
  for (const e of serie.episodes) {
    // eslint-disable-next-line no-underscore-dangle
    if (e._id.toString() === id.toString())
      return e;
  }

  return null;
}

type Params3 = {
  serie: Interface,
  url: string
};
export function getEpisodeByUrl( { serie, url }: Params3) {
  for (const e of serie.episodes) {
    if (e.url === url)
      return e;
  }

  return null;
}

type Params2 = {
  serieUrl: string;
  episodeUrl: string;
};
type Ret = {
  episode: Episode | null;
  serie: Interface | null;
};
export async function findEpisodeByUrl( { serieUrl, episodeUrl }: Params2): Promise<Ret> {
  const serie = await findByUrl(serieUrl);

  if (!serie) {
    return {
      episode: null,
      serie: null,
    };
  }

  const ep = getEpisodeByUrl( {
    serie,
    url: episodeUrl,
  } );

  return {
    episode: ep,
    serie,
  };
}
