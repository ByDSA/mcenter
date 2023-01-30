import { Request, Response } from "express";
import { getById, Serie } from "../db/models/serie.model";

export default async function (req: Request, res: Response) {
  const { id } = getParams(req, res);
  const { connect, disconnect } = (await import("../db/database"));

  connect();
  const serie: Serie | null = await getById(id);

  if (!serie) {
    res.sendStatus(404);

    return;
  }

  res.send(serie);
  disconnect();
}

function getParams(req: Request, res: Response) {
  const { id } = req.params;

  if (!id)
    res.sendStatus(400);

  return {
    id,
  };
}