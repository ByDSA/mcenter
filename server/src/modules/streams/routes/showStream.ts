import { StreamWithHistoryListRepository } from "#modules/streamsWithHistoryList";
import { assertFound } from "#utils/http/validation";
import { Request, Response } from "express";

export default async function f(req: Request, res: Response) {
  const { id } = parseParams(req, res);
  const streamRepository = new StreamWithHistoryListRepository();
  const stream = await streamRepository.getOneById(id);

  assertFound(stream, `Cannot find stream with id=${id}`);

  res.send(stream);
}

function parseParams(req: Request, res: Response) {
  const { id } = req.params;

  if (!id)
    res.sendStatus(400);

  return {
    id,
  };
}