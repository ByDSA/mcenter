import express from "express";
import { findMusicByUrl, getMusicFullPath } from "../../db/models/music";

export default async function rawAccess(req: express.Request, res: express.Response) {
  const { name } = req.params;
  const music = await findMusicByUrl(name);

  if (!music) {
    res.sendStatus(404);

    return;
  }

  const relativePath = music.path;
  const fullpath = getMusicFullPath(relativePath);

  res.download(fullpath, (error) => {
    if (error)
      res.sendStatus(404);
  } );
}
