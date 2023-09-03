import ActionController from "#modules/actions/ActionController";
import { EpisodeRepository } from "#modules/episodes";
import EpisodePickerService from "#modules/episodes/EpisodePicker/EpisodePickerService";
import { HistoryListRepository } from "#modules/historyLists";
import { PickerController } from "#modules/picker";
import { PlaySerieController, PlayStreamController } from "#modules/play";
import { SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams";
import { App, HELLO_WORLD_HANDLER, errorHandler } from "#utils/express";
import { Database } from "#utils/layers/db";
import { PublicMethodsOf } from "#utils/types";
import { assertIsDefined, isDefined } from "#utils/validation";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import schedule from "node-schedule";
import { execSync } from "node:child_process";
import fs from "node:fs";
import serveIndex from "serve-index";

type Dependencies = {
  db?: {
    instance: Database | null | undefined;
  };
  play: {
    playSerieController: PublicMethodsOf<PlaySerieController>;
    playStreamController: PublicMethodsOf<PlayStreamController>;
  };
  pickerController: PublicMethodsOf<PickerController>;
  actionController: PublicMethodsOf<ActionController>;
};

// Necesario para poder replicarla para test
export default class ExpressApp implements App {
  #instance: express.Express | null = null;

  #database: Database | null = null;

  #playSerieController: PublicMethodsOf<PlaySerieController>;

  #playStreamController: PublicMethodsOf<PlayStreamController>;

  #pickerController: PublicMethodsOf<PickerController>;

  #actionController: PublicMethodsOf<ActionController>;

  constructor( {db, play: {playSerieController, playStreamController}, pickerController, actionController}: Dependencies) {
    this.#database = db?.instance ?? null;
    this.#playSerieController = playSerieController;
    this.#playStreamController = playStreamController;
    this.#pickerController = pickerController;
    this.#actionController = actionController;
  }

  async init() {
    if (this.#database) {
      this.#database.init();
      await this.#database.connect();
    }

    const app = express();

    // eslint-disable-next-line global-require
    require("../scheduler");

    app.disable("x-powered-by");

    app.use(helmet());

    const requestLogger = (
      request: Request,
      response: Response,
      next: NextFunction) => {
      console.log(`${request.method} url:: ${request.url}`);
      next();
    };

    app.use(requestLogger);

    if (process.env.NODE_ENV === "development")
      app.get("/", HELLO_WORLD_HANDLER);

    app.use("/api/play/serie", this.#playSerieController.getRouter());
    app.use("/api/play/stream", this.#playStreamController.getRouter());

    app.use("/api/picker", this.#pickerController.getRouter());

    app.use("/api/actions", this.#actionController.getRouter());

    app.get("/api/test/picker/:idstream", async (req: Request, res: Response) => {
      const { idstream } = req.params;
      const episodePickerService = new EpisodePickerService( {
        streamRepository: new StreamRepository(),
        episodeRepository: new EpisodeRepository(),
        serieRepository: new SerieRepository(),
        historyListRepository: new HistoryListRepository(),
      } );
      const nextEpisode = await episodePickerService.getByStreamId(idstream);

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

    const mediaFolderPath = process.env.MEDIA_FOLDER_PATH;

    if (isDefined(mediaFolderPath)) {
      for (const item of ["pelis", "series", "music"]) {
        app.use(`/raw/${item}/`, express.static(`${mediaFolderPath}/${item}/`), serveIndex(`${mediaFolderPath}/${item}/`, {
          view: "details",
          icons: true,
        } ));
      }
    } else
      console.warn("MEDIA_FOLDER_PATH not defined");

    app.use(errorHandler);

    this.#instance = app;
  }

  async close() {
    await this.#database?.disconnect();

    schedule.gracefulShutdown();
  }

  listen() {
    assertIsDefined(this.#instance);
    const PORT: number = +(process.env.PORT ?? 8080);

    killProcessesUsingPort(PORT);
    const listener = this.#instance.listen(PORT, () => {
      const address = listener.address();
      let realPort = PORT;

      if (address && typeof address !== "string")
        realPort = address.port;

      console.log(`Server Listening on http://localhost:${realPort}`);
    } );
  }

  getExpressApp(): express.Express | null {
    return this.#instance;
  }
}

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