import express from "express";
import { newPicker } from "rand-picker";
import { Music } from "../../db/models/music";
import { ROUTE_RAW } from "../routes.api.config";
import { HOST, PORT } from "../routes.config";
import { findAllMusicsAndFilter } from "./routes.get-all";

export default async function getRandom(req: express.Request, res: express.Response) {
  const musics = await findAllMusicsAndFilter(req);
  const picked = randomPick(musics);
  const ret = generatePlaylist(picked, req.url);

  res.send(ret);
}

function randomPick(musics: Music[]): Music {
  const picker = newPicker(musics, {
    weighted: true,
  } );

  for (const m of musics) {
    const initialWeight = m.weight || 0;
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

function generatePlaylist(picked: Music, nextUrl: string): string {
  const SERVER = `http://${HOST}:${PORT}`;
  const ret = `#EXTM3U
  #EXTINF:317,${picked.title}
  ${SERVER}/${ROUTE_RAW}/${picked.url}
  #EXTINF:-1,NEXT
  ${nextUrl}`;

  return ret;
}

function getFinalWeight(value: number): number {
  if (value >= -1 && value <= 1)
    return 1;

  if (value < 0)
    return 1 / -value;

  return value;
}
