import { Request, Response } from "express";
import { newPicker } from "rand-picker";
import { Music, MusicInterface } from "../../db/models/resources/music";
import { generateLinkedPlaylist } from "../multimedia/misc";
import { findAllMusicsAndFilter } from "./get-all";
import { getFullUrl } from "./urls";

export default async function getRandom(req: Request, res: Response) {
  const musics = await findAllMusicsAndFilter(req);
  const resource = randomPick(musics);
  const { url } = req;
  const fullUrlFunc = getFullUrl;
  const ret = generateLinkedPlaylist<MusicInterface>( {
    resource,
    nextUrl: url,
    fullUrlFunc,
  } );

  res.send(ret);
}

function randomPick(musics: Music[]): Music {
  const picker = newPicker(musics, {
    weighted: true,
  } );

  for (const m of musics) {
    const initialWeight = 0;
    let finalWeight = getFinalWeight(initialWeight);

    if (initialWeight <= -99)
      finalWeight = 0;

    picker.put(m, finalWeight);
  }

  let picked = picker.pickOne();

  if (!picked)
    [picked] = musics;

  return picked;
}

function getFinalWeight(value: number): number {
  if (value >= -1 && value <= 1)
    return 1;

  if (value < 0)
    return 1 / -value;

  return value;
}
