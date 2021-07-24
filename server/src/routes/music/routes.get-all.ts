import express from "express";
import { findAllMusics, Music } from "../../db/models/music";

export default async function getAll(req: express.Request, res: express.Response) {
  const musics = await findAllMusicsAndFilter(req);

  // const ret = generateView(musics);
  sortMusics(musics);
  res.send(musics);
}

export async function findAllMusicsAndFilter(req: express.Request): Promise<Music[]> {
  let musics = await findAllMusics();
  const tagsQuery = <string | undefined>req.query.tags;
  const minWeightQuery = <string | undefined>req.query.minWeight;
  const maxWeightQuery = <string | undefined>req.query.maxWeight;

  if (minWeightQuery !== undefined) {
    const minWeight = parseInt(minWeightQuery, 10);

    musics = musics.filter((m) => (m.weight || 0) >= minWeight);
  }

  if (maxWeightQuery !== undefined) {
    const maxWeight = parseInt(maxWeightQuery, 10);

    musics = musics.filter((m) => (m.weight || 0) <= maxWeight);
  }

  if (tagsQuery)
    musics = musics.filter((m) => m.tags?.includes(tagsQuery));

  return musics;
}

function sortMusics(musics: Music[]): Music[] {
  return musics.sort((a: Music, b: Music) => {
    if (!a.artist || !b.artist || a.artist === b.artist)
      return a.title.localeCompare(b.title);

    return a.artist.localeCompare(b.artist);
  } );
}

export function generateView(musics: Music[]): string {
  let ret = "<ul>";

  musics.map((m) => `<li><a href='/raw/${m.url}'>${m.title}</li>`)
    .forEach((line) => { ret += line; } );
  ret += "</ul>";

  return ret;
}
