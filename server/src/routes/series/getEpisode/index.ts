import App from "@app/app";
import { findEpisodeByUrl } from "@models/resources/serie";
import { Request, Response } from "express";
import downloadEpisode from "./download";
import getObj from "./getObj";

export default function getEpisodeApp(app: App) {
  return (req: Request, res: Response) => getEpisode(req, res, app);
}

async function getEpisode(req: Request, res: Response, app: App) {
  const { serieUrl, episodeUrl } = req.params;
  const { raw } = req.query;

  if (!serieUrl || !episodeUrl) {
    res.sendStatus(400);

    return;
  }

  const { episode, serie } = await findEpisodeByUrl( {
    serieUrl,
    episodeUrl,
  } );

  if (!episode || !serie) {
    res.sendStatus(404);

    return;
  }

  if (raw) {
    downloadEpisode( {
      serie,
      episode,
      res,
    } );
  } else {
    const ret = getObj( {
      episode,
      serie,
      app,
    } );

    res.send(ret);
  }
}

export {
  getObj as getEpisodeObj,
};
