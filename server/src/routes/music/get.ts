import express from "express";
import { findMusicByUrl, getMusicFullPath } from "../../db/models/music";

export default async function get(req: express.Request, res: express.Response) {
  const { url } = req.params;
  const music = await findMusicByUrl(url);

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
