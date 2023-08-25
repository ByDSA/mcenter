import { asyncCalculateNextEpisodeByIdStream } from "#modules/episodes";
import { PickerController } from "#modules/picker";
import { PlaySerieController, PlayStreamController } from "#modules/play";
import { App, HELLO_WORLD_HANDLER, errorHandler } from "#utils/express";
import { Database } from "#utils/layers/db";
import { PublicMethodsOf } from "#utils/types";
import { assertIsDefined } from "#utils/validation";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import schedule from "node-schedule";
import { execSync } from "node:child_process";
import fs from "node:fs";

type Dependencies = {
  db?: {
    instance: Database | null | undefined;
  };
  play: {
    playSerieController: PublicMethodsOf<PlaySerieController>;
    playStreamController: PublicMethodsOf<PlayStreamController>;
  };
  pickerController: PublicMethodsOf<PickerController>;
};

// Necesario para poder replicarla para test
export default class ExpressApp implements App {
  #instance: express.Express | null = null;

  #database: Database | null = null;

  #playSerieController: PublicMethodsOf<PlaySerieController>;

  #playStreamController: PublicMethodsOf<PlayStreamController>;

  #pickerController: PublicMethodsOf<PickerController>;

  constructor( {db, play: {playSerieController, playStreamController}, pickerController}: Dependencies) {
    this.#database = db?.instance ?? null;
    this.#playSerieController = playSerieController;
    this.#playStreamController = playStreamController;
    this.#pickerController = pickerController;
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

    app.use("/api/picker", this.#pickerController.getPickerRouter());

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

    this.#instance = app;
  }

  async close() {
    await this.#database?.disconnect();

    schedule.gracefulShutdown();
  }

  listen() {
    assertIsDefined(this.#instance);
    const PORT: number = process.env.NODE_ENV === "development" ? +(process.env.PORT ?? 8080) : 8080;

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