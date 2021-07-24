import Doc from "./document";
import Model from "./model";

export async function findByHash(hash: string): Promise<Doc | null> {
  const doc: Doc | null = await Model.findOne( {
    hash,
  } );

  return doc;
}

export async function findByUrl(url: string): Promise<Doc | null> {
  const doc: Doc | null = await Model.findOne( {
    url,
  } );

  return doc;
}

export async function findAll(): Promise<Array<Doc>> {
  const ret = await Model.find( {
  } );

  return ret;
}

export async function findByPath(relativePath: string): Promise<Doc | null> {
  const doc = await Model.findOne( {
    path: relativePath,
  } );

  return doc;
}
