import { StreamWithHistoryListRepository } from "#modules/streamWithHistoryList";
import { Request, Response } from "express";

export default async function f(req: Request, res: Response) {
  const { id } = parseParams(req, res);
  const streamRepository = new StreamWithHistoryListRepository();
  const stream = await streamRepository.getOneById(id);

  if (stream)
    res.send(stream);
  else
    res.sendStatus(404);
}

function parseParams(req: Request, res: Response) {
  const { id } = req.params;

  if (!id)
    res.sendStatus(400);

  return {
    id,
  };
}