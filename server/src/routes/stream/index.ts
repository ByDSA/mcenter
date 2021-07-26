import { Express, Request, Response } from "express";
import asyncCalculateNextEpisodeByIdStream from "../../GroupPicker/GroupPicker";
import { STREAM_GET, STREAM_PLAY } from "./config";
import playStreamFunc from "./playStream";
import showStreamFunc from "./showStream";

export default function apiRoutes(app: Express) {
  app.get(`${STREAM_PLAY}/:id/:number?`, playStreamFunc);

  app.get(`${STREAM_GET}/:id`, showStreamFunc);

  app.get("/api/test/picker/:idstream", async (req: Request, res: Response) => {
    const { idstream } = req.params;
    const nextEpisode = await asyncCalculateNextEpisodeByIdStream(idstream);

    res.send(nextEpisode);
  } );
}
