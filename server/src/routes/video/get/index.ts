import App from "@app/app";
import { findVideoByUrl } from "@app/db/models/resources/video";
import { Request, Response } from "express";
import getObj from "../getObj";
import downloadVideo from "./download";

export default function getApp(app: App) {
  return (req: Request, res: Response) => get(req, res, app);
}

async function get(req: Request, res: Response, app: App) {
  const { url } = req.params;
  const { raw } = req.query;
  const video = await findVideoByUrl(url);

  if (!video) {
    res.sendStatus(404);

    return;
  }

  if (raw) {
    downloadVideo( {
      video,
      res,
    } );
  } else {
    const ret = getObj( {
      video,
      app,
    } );

    res.send(ret);
  }
}
