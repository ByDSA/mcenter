import { Request, Response } from "express";
import { StreamRepository } from "#modules/stream";

// eslint-disable-next-line func-names, require-await
export default async function (req: Request, res: Response) {
  const { id } = parseParams(req, res);
  const stream = await StreamRepository.getInstance<StreamRepository>().findOneById(id);

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