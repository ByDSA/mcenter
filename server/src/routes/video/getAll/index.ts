import App from "@app/app";
import { findAllVideos } from "@app/db/models/resources/video";
import { Request, Response } from "express";
import getObj, { VideoObjType } from "../getObj";

export default function getAllApp(app: App) {
  return (req: Request, res: Response) => getAll(req, res, app);
}

async function getAll(req: Request, res: Response, app: App) {
  const videos = await findAllVideos();
  const musicsObj: VideoObjType[] = videos.map((v) => getObj( {
    video: v,
    app,
  } ));

  sort(musicsObj);
  res.send(musicsObj);
}

function sort(musics: VideoObjType[]): VideoObjType[] {
  return musics.sort((a: VideoObjType, b: VideoObjType) => {
    if (a.name && b.name)
      return a.name.localeCompare(b.name);

    return a.url.localeCompare(b.url);
  } );
}
