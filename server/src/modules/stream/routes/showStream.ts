import { SerieRepository } from "#modules/series/serie";
import { StreamRepository } from "#modules/stream";
import { Request, Response } from "express";

// eslint-disable-next-line func-names, require-await
export default async function (req: Request, res: Response) {
  const { id } = parseParams(req, res);
  const serieRepository = new SerieRepository();
  const streamRepository = new StreamRepository( {
    serieRepository,
  } );
  const stream = await streamRepository.findOneByIdOrCreateFromSerie(id);

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