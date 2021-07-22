import express from "express";
import { findByUrl } from "../../db/models/music";
import { getFullPathMusic } from "../../env";

export default async function rawAccess(req: express.Request, res: express.Response) {
  const { name } = req.params;
  const music = await findByUrl(name);

  if (!music) {
    res.sendStatus(404);

    return;
  }

  const relativePath = music.path;
  const fullpath = getFullPathMusic(relativePath);

  res.download(fullpath, (error) => {
    if (error)
      res.sendStatus(404);
  } );
}
