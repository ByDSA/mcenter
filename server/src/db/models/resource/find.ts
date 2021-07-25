import { Document, Model } from "mongoose";

export type Config<D extends Document, M extends Model<D>> = {
  model: M;
};

export function generateCommonFunctions<D extends Document, M extends Model<D>>(
  config: Config<D, M>,
) {
  const model = <any>config.model;

  async function findByHash(hash: string): Promise<D | null> {
    const music: D | null = await model.findOne( {
      hash,
    } );

    return music;
  }

  async function findByUrl(url: string): Promise<D | null> {
    const music: D | null = await model.findOne( {
      url,
    } );

    return music;
  }

  async function findAll(): Promise<Array<D>> {
    const ret = await model.find( {
    } );

    return ret;
  }

  async function findByPath(relativePath: string): Promise<D | null> {
    const music = await model.findOne( {
      path: relativePath,
    } );

    return music;
  }

  return {
    findByHash,
    findByUrl,
    findByPath,
    findAll,
  };
}
