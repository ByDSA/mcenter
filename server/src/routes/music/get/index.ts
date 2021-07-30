import App from "@app/app";
import { findMusicByUrl } from "@models/resources/music";
import { Request, Response } from "express";
import getObj from "../getObj";
import downloadMusic from "./download";

export default function getApp(app: App) {
  return (req: Request, res: Response) => get(req, res, app);
}

async function get(req: Request, res: Response, app: App) {
  const { url } = req.params;
  const { raw } = req.query;
  const music = await findMusicByUrl(url);

  if (!music) {
    res.sendStatus(404);

    return;
  }

  if (raw) {
    downloadMusic( {
      music,
      res,
    } );
  } else {
    const ret = getObj( {
      music,
      app,
    } );

    res.send(ret);
  }
}
