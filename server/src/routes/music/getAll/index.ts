import App from "@app/app";
import { Request, Response } from "express";
import { findAllMusics } from "../../../db/models/resources/music";
import getObj, { MusicObjType } from "../getObj";

export default function getAllApp(app: App) {
  return (req: Request, res: Response) => getAll(req, res, app);
}

async function getAll(req: Request, res: Response, app: App) {
  const musics = await findAllMusics();
  const musicsObj: MusicObjType[] = musics.map((m) => getObj( {
    music: m,
    app,
  } ));

  sortMusics(musicsObj);
  res.send(musicsObj);
}

function sortMusics(musics: MusicObjType[]): MusicObjType[] {
  return musics.sort((a: MusicObjType, b: MusicObjType) => {
    if (!a.artist || !b.artist || a.artist === b.artist) {
      if (a.name && b.name)
        return a.name.localeCompare(b.name);

      return a.url.localeCompare(b.url);
    }

    return a.artist.localeCompare(b.artist);
  } );
}
