import express, { Request, Response } from "express";
import fs from "fs";
import playFunc, { playSerieFunc } from "./src/actions/play";
import playStreamFunc from "./src/actions/playStream";
import showPickerFunc from "./src/actions/showPicker";
import showSerieFunc from "./src/actions/showSerie";
import showStreamFunc from "./src/actions/showStream";
import { backup } from "./src/backup/backupStuff";
import { connect } from "./src/db/database";
import asyncCalculateNextEpisodeByIdStream from "./src/EpisodePicker/EpisodePicker";

const app = express();
const s = require("./src/scheduler");

app.disable("x-powered-by");

const PORT = 8081;

connect();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World! ");
} );

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

app.get("/api/backup", async (req: Request, res: Response) => {
  await backup();
  res.send("Done!");
} );

app.listen(PORT, () => {
  console.log(`Server Listening on ${PORT}`);
} );
