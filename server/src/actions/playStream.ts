import { Request, Response } from "express";
import { Episode } from "#modules/episode";
import { History } from "#modules/history";
import { SerieRepository } from "#modules/serie";
import { Stream, StreamRepository } from "#modules/stream";
import { pickAndAddHistory, play } from "./play";

export default async function f(req: Request, res: Response) {
  console.log("playStream");
  const { id, number, force } = getParams(req, res);
  const stream = await StreamRepository.getInstance<StreamRepository>().findOneById(id);

  if (!stream) {
    res.sendStatus(404);

    return;
  }

  const episodes = await pickAndAddHistory(stream, +number);
  const forceBoolean: boolean = !!+force;

  await play(episodes, forceBoolean);

  res.send(episodes);
}

export async function getlastEp(stream: Stream): Promise<Episode | null> {
  let lastEp = null;

  if (stream.history.length > 0) {
    const lastHistory: History = stream.history[stream.history.length - 1];
    const lastEpId = lastHistory.episodeId;
    const serie = await SerieRepository.getInstance<SerieRepository>().findOneFromGroupId(stream.group);

    lastEp = serie?.episodes.find((e) => e.id === lastEpId) || null;
  }

  return lastEp;
}

function getParams(req: Request, res: Response) {
  const forceStr = req.query.force;
  const force = !!forceStr;
  const { id } = req.params;
  let { number } = req.params;

  if (!id)
    res.sendStatus(400);

  if (!number)
    number = "1";

  return {
    id,
    number,
    force,
  };
}
