/* eslint-disable no-continue */
/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
import express from "express";
import { fixAllMusics, fixOneMusic } from "../../db/models/music";

export async function fixAll(req: express.Request, res: express.Response) {
  const fixed = await fixAllMusics();

  res.send(fixed);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
