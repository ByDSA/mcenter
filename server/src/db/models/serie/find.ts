import { generateFromFiles } from "./create";
import Doc from "./document";
import Model from "./model";

/* eslint-disable import/prefer-default-export */
export async function findByUrl(url: string): Promise<Doc | null> {
  let serie: Doc|null = await Model.findOne( {
    url,
  } );

  if (!serie) {
    const generatedSerie = await generateFromFiles(url);

    if (!generatedSerie)
      return null;

    serie = generatedSerie;
  }

  return serie;
}

export async function findAll(): Promise<Array<Doc>> {
  const ret = await Model.find( {
  } );

  return ret;
}

export async function findByPath(relativePath: string): Promise<Doc | null> {
  const music = await Model.findOne( {
    path: relativePath,
  } );

  return music;
}
