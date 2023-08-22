import { HistoryListRepository, HistoryListService } from "#modules/history";
import { PlaySerieController, PlayService, PlayStreamController, VLCService } from "#modules/play";
import { EpisodeRepository, asyncCalculateNextEpisodeByIdStream } from "#modules/series/episode";
import { SerieWithEpisodesRepository } from "#modules/series/serie";
import { addSerieRoutes } from "#modules/series/serie/routes";
import { addStreamRoutes } from "#modules/stream/routes";
import { StreamWithHistoryListRepository, StreamWithHistoryListService } from "#modules/streamWithHistoryList";
import { HELLO_WORLD_HANDLER, errorHandler } from "#utils/express";
import { execSync } from "child_process";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import fs from "fs";
import showPickerFunc from "./actions/showPicker";
import { connect } from "./db/database";

dotenv.config();
const PORT = +(process.env.PORT ?? 8080);
const app = express();
// eslint-disable-next-line import/no-internal-modules, @typescript-eslint/no-unused-vars
const s = require("./scheduler");

app.disable("x-powered-by");

connect();

const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction) => {
  console.log(`${request.method} url:: ${request.url}`);
  next();
};

app.use(requestLogger);

app.get("/", HELLO_WORLD_HANDLER);

addStreamRoutes(app);
addSerieRoutes(app);

const streamWithHistoryListRepository = new StreamWithHistoryListRepository();
const streamWithHistoryListService = new StreamWithHistoryListService();
const historyListRepository = new HistoryListRepository();
const serieRepository = new SerieWithEpisodesRepository();
const episodeRepository = new EpisodeRepository( {
  serieRepository,
} );
const historyService = new HistoryListService( {
  episodeRepository,
  historyRepository: historyListRepository,
} );
const vlcService = new VLCService();
const playService = new PlayService( {
  vlcService,
  streamWithHistoryListRepository,
  historyListService: historyService,
} );
const playSerieController = new PlaySerieController( {
  serieRepository,
  playService,
} );
const playStreamController = new PlayStreamController( {
  playService,
  streamWithHistoryListRepository,
  serieWithEpisodesRepository: serieRepository,
  streamWithHistoryListService,
} );

app.use("/api/play/serie", playSerieController.getRouter());
app.use("/api/play/stream", playStreamController.getRouter());

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

app.use(errorHandler);

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
