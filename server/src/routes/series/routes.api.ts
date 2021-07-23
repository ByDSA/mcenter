import { Express, Request, Response } from "express";
import fs from "fs";
import asyncCalculateNextEpisodeByIdStream from "../../GroupPicker/GroupPicker";
import playFunc, { playSerieFunc } from "./play";
import playStreamFunc from "./playStream";
import showPickerFunc from "./showPicker";
import showSerieFunc from "./showSerie";
import showStreamFunc from "./showStream";

export default function apiRoutes(app: Express) {
  app.get("/api/play/stream/:id/:number?", playStreamFunc);

  app.get("/api/play/serie/:name/:id", playSerieFunc);
  app.get("/api/play/:type/:id", playFunc);

  app.get("/api/crud/series/:id", showSerieFunc);
  app.get("/api/picker/:streamId", showPickerFunc);
  app.get("/api/crud/streams/:id", showStreamFunc);

  app.get("/api/stop", (req: Request, res: Response) => {
    fs.writeFileSync(".stop", "");
    res.send("stop");
  } );

  app.get("/api/resume", (req: Request, res: Response) => {
    if (fs.existsSync(".stop")) {
      fs.unlinkSync(".stop");
      res.send("resume");
    } else
      res.send("Already resumed");
  } );

  app.get("/api/test/picker/:idstream", async (req: Request, res: Response) => {
    const { idstream } = req.params;
    const nextEpisode = await asyncCalculateNextEpisodeByIdStream(idstream);

    res.send(nextEpisode);
  } );
}
