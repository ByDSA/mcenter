import { fixAllMusics, fixOneMusic } from "@models/resources/music";
import express from "express";

export async function fixAll(req: express.Request, res: express.Response) {
  const fixed = await fixAllMusics();

  res.send(fixed);
}

export async function fixOne(req: express.Request, res: express.Response) {
  const local = <string | undefined>req.query.local;
  const url = <string | undefined>req.query.url;
  const fixed = await fixOneMusic( {
    local,
    url,
  } );

  if (!fixed)
    res.sendStatus(404);
  else
    res.send(fixed);
}
