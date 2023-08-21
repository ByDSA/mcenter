import { SerieRepository } from "#modules/series/serie";
import { StreamRepository } from "#modules/stream";
import { Request, Response } from "express";

export default async function f(req: Request, res: Response) {
  const { id } = parseParams(req, res);
  const serieRepository = new SerieRepository();
  const streamRepository = new StreamRepository( {
    serieRepository,
  } );
  const stream = await streamRepository.getOneByIdOrCreateFromSerie(id);

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