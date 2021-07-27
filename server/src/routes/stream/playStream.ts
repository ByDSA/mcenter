import { Request, Response } from "express";
import { getById } from "../db/models/stream.model";
import { pickAndAddHistory, play } from "../series/play";

export default async function f(req: Request, res: Response) {
  console.log("playStream");
  const { id, number, force } = getParams(req, res);
  const stream = await getById(id);

  if (!stream) {
    res.sendStatus(404);

    return;
  }

  const episodes = await pickAndAddHistory(stream, +number);
  const forceBoolean: boolean = !!+force;

  await play(episodes, forceBoolean);

  res.send(episodes);
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
