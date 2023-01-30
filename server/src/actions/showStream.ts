import { Request, Response } from "express";
import { getById } from "../db/models/stream.model";

// eslint-disable-next-line func-names, require-await
export default async function (req: Request, res: Response) {
  const { id } = getParams(req, res);

  getById(id).then(stream => {
    if (stream)
      res.send(stream);
    else
      res.sendStatus(404);
  } );
}

function getParams(req: Request, res: Response) {
  const { id } = req.params;

  if (!id)
    res.sendStatus(400);

  return {
    id,
  };
}