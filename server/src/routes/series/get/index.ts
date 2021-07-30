import { findSerieByUrl, Serie } from "@models/resources/serie";
import { Request, Response } from "express";

export default async function get(req: Request, res: Response) {
  const { url } = req.params;

  if (!url) {
    res.sendStatus(400);

    return;
  }

  const serie: Serie | null = await findSerieByUrl(url);

  if (!serie) {
    res.sendStatus(404);

    return;
  }

  res.send(serie);
}
