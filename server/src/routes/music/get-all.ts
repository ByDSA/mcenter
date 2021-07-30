import { Request, Response } from "express";
import { findAllMusics, Music } from "../../db/models/resources/music";

export default async function getAll(req: Request, res: Response) {
  const musics = await findAllMusicsAndFilter(req);

  // const ret = generateView(musics);
  sortMusics(musics);
  res.send(musics);
}

export async function findAllMusicsAndFilter(req: Request): Promise<Music[]> {
  let musics = await findAllMusics();
  const tagsQuery = <string | undefined>req.query.tags;

  if (tagsQuery)
    musics = musics.filter((m) => m.tags?.includes(tagsQuery));

  return musics;
}

function sortMusics(musics: Music[]): Music[] {
  return musics.sort((a: Music, b: Music) => {
    if (!a.artist || !b.artist || a.artist === b.artist)
      return a.name.localeCompare(b.name);

    return a.artist.localeCompare(b.artist);
  } );
}
