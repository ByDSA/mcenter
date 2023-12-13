import express from "express";
import { newPicker } from "rand-picker";
import { Music } from "../../db/models/music";
import { SERVER } from "../routes.config";
import { ROUTE_RAW } from "./routes.api.config";
import { findAllMusicsAndFilter } from "./routes.get-all";

let lastPicked: Music | undefined;

export default async function getRandom(req: express.Request, res: express.Response) {
  const musics = await findAllMusicsAndFilter(req);
  const picked = randomPick(musics);
  const ret = generatePlaylist(picked, req.url);

  res.send(ret);
}

function randomPick(musics: Music[]): Music {
  const picker = newPicker(musics, {
    weighted: true,
    randomMode: 0,
  } );

  for (const m of musics) {
    const initialWeight = m.weight || 0;
    let finalWeight = getFinalWeight(initialWeight);

    if (initialWeight <= -99)
      finalWeight = 0;

    if (m.url === lastPicked?.url)
      finalWeight = 0;

    picker.put(m, finalWeight);
  }

  if (lastPicked) {
    if (picker.length === 1)
      return lastPicked;
  }

  let picked = picker.pickOne();

  if (!picked)
    [picked] = musics;

  lastPicked = picked;

  return picked;
}

function generatePlaylist(picked: Music, nextUrl: string): string {
  const ret = `#EXTM3U
  #EXTINF:317,${picked.title}
  ${SERVER}${ROUTE_RAW}/${picked.url}
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
