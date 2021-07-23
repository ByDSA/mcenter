import Music from "./document";
import MusicModel from "./model";

export async function findByHash(hash: string): Promise<Music | null> {
  const music: Music | null = await MusicModel.findOne( {
    hash,
  } );

  return music;
}

export async function findByUrl(url: string): Promise<Music | null> {
  const music: Music | null = await MusicModel.findOne( {
    url,
  } );

  return music;
}

export async function findAll(): Promise<Array<Music>> {
  const ret = await MusicModel.find( {
  } );

  return ret;
}

export async function findByPath(relativePath: string): Promise<Music | null> {
  const music = await MusicModel.findOne( {
    path: relativePath,
  } );

  return music;
}
