import { asyncCalculateNextEpisodeByIdStream } from "#modules/series/episode";
import { addSerieRoutes } from "#modules/series/serie/routes";
import { addStreamRoutes } from "#modules/stream/routes";
import { HELLO_WORLD_HANDLER } from "#modules/utils/base/http/routing/utils";
import express, { Request, Response } from "express";
import fs from "fs";
import playFunc, { playSerieFunc } from "./src/actions/play";
import showPickerFunc from "./src/actions/showPicker";
import { connect } from "./src/db/database";

const app = express();
// eslint-disable-next-line import/no-internal-modules, @typescript-eslint/no-unused-vars
const s = require("./src/scheduler");

app.disable("x-powered-by");

const PORT = 8011;

connect();

app.get("/", HELLO_WORLD_HANDLER);

addStreamRoutes(app);
addSerieRoutes(app);

app.get("/api/play/serie/:name/:id", playSerieFunc);
app.get("/api/play/:type/:id", playFunc);
app.get("/api/picker/:streamId", showPickerFunc);

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

app.listen(PORT, () => {
  console.log(`Server Listening on ${PORT}`);
} );
