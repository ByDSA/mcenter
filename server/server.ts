import { PlayController, PlayService, VLCService } from "#modules/play";
import { asyncCalculateNextEpisodeByIdStream } from "#modules/series/episode";
import { SerieRepository } from "#modules/series/serie";
import { addSerieRoutes } from "#modules/series/serie/routes";
import { addStreamRoutes } from "#modules/stream/routes";
import { HELLO_WORLD_HANDLER } from "#modules/utils/base/http/routing/utils";
import { execSync } from "child_process";
import express, { Request, Response } from "express";
import fs from "fs";
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

const serieRepository = SerieRepository.getInstance<SerieRepository>();
const vlcService = new VLCService();
const playService = new PlayService(vlcService);
const playController = new PlayController( {
  serieRepository,
  service: playService,
} );

app.use("/api/play", playController.getRouter());

app.get("/api/picker/:streamId", showPickerFunc);

app.get("/api/test/picker/:idstream", async (req: Request, res: Response) => {
  const { idstream } = req.params;
  const nextEpisode = await asyncCalculateNextEpisodeByIdStream(idstream);

  res.send(nextEpisode);
} );

// Config
const configRoutes = express.Router();

configRoutes.get("/stop", (req: Request, res: Response) => {
  fs.writeFileSync(".stop", "");
  res.send("stop");
} );

configRoutes.get("/resume", (req: Request, res: Response) => {
  if (fs.existsSync(".stop")) {
    fs.unlinkSync(".stop");
    res.send("resume");
  } else
    res.send("Already resumed");
} );

app.use("/config", configRoutes);

killProcessesUsingPort(PORT);
const listener = app.listen(PORT, () => {
  const { port } = listener.address() as { port: number };

  console.log(`Server listening on port ${port}`);
} );

function killProcessesUsingPort(port: number): void {
  // kill process which is using port PORT
  const processes = execSync(`lsof -i :${port} | grep node || true`).toString()
    .split("\n");

  if (processes.length === 0)
    return;

  for (const p of processes) {
    const pId = +p.split(" ")[1];

    if (pId)
      execSync(`kill -9 ${pId}`);
  }
}