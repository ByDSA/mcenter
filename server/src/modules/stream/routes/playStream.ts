import { StreamRepository } from "#modules/stream";
import { Request, Response } from "express";
import { pickAndAddHistory, play } from "../../../actions/play";

export default async function f(req: Request, res: Response) {
  console.log("playStream");
  const { id, number, force } = parseParams(req, res);
  const stream = await StreamRepository.getInstance<StreamRepository>().findOneById(id);

  if (!stream) {
    res.sendStatus(404);

    return;
  }

  const episodes = await pickAndAddHistory(stream, number);

  await play(episodes, force);

  res.send(episodes);
}

function parseParams(req: Request, res: Response) {
  const forceStr = req.query.force;
  const force = !!forceStr;
  const { id } = req.params;
  const number = +(req.params.number ?? 1);

  if (!id)
    res.sendStatus(400);

  return {
    id,
    number,
    force,
  };
}
