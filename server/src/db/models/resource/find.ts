import { Document, Model, Schema } from "mongoose";
import { GroupModel } from "../group";
import { MusicModel } from "../music";
import { VideoModel } from "../video";
import { ResourceInterface } from "./interface";

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

  async function findByName(name: string): Promise<D | null> {
    const music: D | null = await model.findOne( {
      name,
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
    findByName,
    findAll,
  };
}

export type TypeResource = "Music" | "Video" | { serieId: string };

type Params = {type: TypeResource, id: Schema.Types.ObjectId};
// eslint-disable-next-line require-await
export async function findFromItem(
  { type, id }: Params,
): Promise<ResourceInterface | null> {
  switch (type) {
    case "video": return <ResourceInterface | null><unknown>VideoModel.findById(id);
    case "music": return <ResourceInterface | null><unknown>MusicModel.findById(id);
    case "group": return <ResourceInterface | null><unknown>GroupModel.findById(id);
    default: throw new Error();
  }
}
