import { findMusicByUrl, getMusicFullPath } from "@models/resources/music";
import { Request, Response } from "express";

export default async function get(req: Request, res: Response) {
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
      res.sendStatus(500);
  } );
}
