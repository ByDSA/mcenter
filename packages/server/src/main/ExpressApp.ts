import { execSync } from "node:child_process";
import fs from "node:fs";
import { Server } from "node:http";
import { showError } from "#shared/utils/errors/showError";
import { ForbiddenError } from "#shared/utils/http";
import { deepFreeze, deepMerge } from "#shared/utils/objects";
import { OptionalPropsRecursive } from "#shared/utils/types";
import { assertIsDefined, isDefined } from "#shared/utils/validation";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import schedule from "node-schedule";
import serveIndex from "serve-index";
import { EpisodeRestController } from "#episodes/index";
import { ActionController } from "#modules/actions";
import { EpisodePickerController, EpisodePickerService } from "#modules/episode-picker";
import { HistoryListRestController } from "#modules/historyLists";
import { PlaySerieController, PlayStreamController } from "#modules/play";
import { StreamRestController } from "#modules/streams";
import { MusicController } from "#musics/index";
import { nms as mediaServer } from "#musics/MediaServer";
import { App, HELLO_WORLD_HANDLER, errorHandler } from "#utils/express";
import { Database } from "#utils/layers/db";
import { resolveRequired } from "#utils/layers/deps";

export type ExpressAppDependencies = {
  db: {
    instance: Database;
  };
  controllers: {
    cors?: boolean;
  };
};

const DEFAULT_DEPENDENCIES: OptionalPropsRecursive<ExpressAppDependencies> = deepFreeze( {
  controllers: {
    cors: true,
  },
} );

// Necesario para poder replicarla para test
export class ExpressApp implements App {
  #instance: express.Express | null = null;

  #dependencies: Required<ExpressAppDependencies>;

  #httpServerRequirers: ((server: Server)=> void)[] = [];

  constructor(deps?: ExpressAppDependencies) {
    this.#dependencies = deepMerge(
      DEFAULT_DEPENDENCIES as Required<ExpressAppDependencies>,
      deps,
    ) as Required<ExpressAppDependencies>;
  }

  onHttpServerListen(requirer: (server: Server)=> void) {
    this.#httpServerRequirers.push(requirer);
  }

  async init(app: express.Express) {
    const db = this.#dependencies.db.instance;

    if (db) {
      db.init();
      await db.connect();
    }

    require("../scheduler");

    app.disable("x-powered-by");

    app.use(helmet());

    const requestLogger = (
      request: Request,
      _: Response,
      next: NextFunction,
    ) => {
      console.log(`[${request.method}] ${request.url}`);
      next();
    };

    app.use(requestLogger);

    if (this.#dependencies.controllers.cors) {
      const { FRONTEND_URL } = process.env;

      assertIsDefined(FRONTEND_URL);
      const whitelist: string[] = [FRONTEND_URL];

      app.use(cors( {
        preflightContinue: true,
        origin(origin, callback) {
          const allowsAnyOrigin = true;
          const originUrl = origin ? new URL(origin) : null;
          const originIsLocal = originUrl && (originUrl.hostname === "localhost" || originUrl.hostname.startsWith("192.168."));
          const allows = (
            origin
             && (whitelist.includes(origin) || originIsLocal)
          ) || allowsAnyOrigin;

          if (allows)
            callback(null, true);
          else
            callback(new ForbiddenError("Not allowed by CORS"));
        },
      } ));
    }

    if (process.env.NODE_ENV === "development")
      app.get("/", HELLO_WORLD_HANDLER);

    const playSerieController = resolveRequired(PlaySerieController);

    app.use("/api/play/serie", playSerieController.getRouter());

    const playStreamController = resolveRequired(PlayStreamController);

    app.use("/api/play/stream", playStreamController.getRouter());

    const pickerController = resolveRequired(EpisodePickerController);

    app.use("/api/picker", pickerController.getRouter());

    const actionController = resolveRequired(ActionController);

    app.use("/api/actions", actionController.getRouter());
    const historyListRestController = resolveRequired(HistoryListRestController);

    app.use("/api/history-list", historyListRestController.getRouter());

    const streamRestController = resolveRequired(StreamRestController);

    app.use("/api/streams", streamRestController.getRouter());

    const episodesRestController = resolveRequired(EpisodeRestController);

    app.use("/api/episodes", episodesRestController.getRouter());

    const musicController = resolveRequired(MusicController);

    app.use("/api/musics", musicController.getRouter());

    app.get("/api/test/picker/:idstream", async (req: Request, res: Response) => {
      const { idstream } = req.params;
      const episodePickerService = resolveRequired(EpisodePickerService);
      const nextEpisode = await episodePickerService.getByStreamId(idstream);

      res.send(nextEpisode);
    } );

    // Config
    const configRoutes = express.Router();

    configRoutes.get("/stop", (_req: Request, res: Response) => {
      fs.writeFileSync(".stop", "");
      res.send("stop");
    } );

    configRoutes.get("/resume", (_req: Request, res: Response) => {
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
        app.use(`/raw/${item}/`, express.static(`${mediaFolderPath}/${item}/`, {
          acceptRanges: false, // Evita que a veces salga el error de "Range Not Satisfiable"
        } ), serveIndex(`${mediaFolderPath}/${item}/`, {
          view: "details",
          icons: true,
        } ));
      }

      for (const item of ["docs"]) {
        app.use(`/raw/${item}/`, express.static(`${mediaFolderPath}/${item}/`, {
          acceptRanges: false, // Evita que a veces salga el error de "Range Not Satisfiable"
        } ));
      }
    } else
      console.warn("MEDIA_FOLDER_PATH not defined");

    app.use(errorHandler);

    this.#instance = app;
  }

  async close() {
    await this.#dependencies.db.instance.disconnect();

    schedule.gracefulShutdown()
      .catch(showError);
  }

  // eslint-disable-next-line require-await
  async listen(httpServer: Server) {
    assertIsDefined(this.#instance);
    const PORT: number = +(process.env.PORT ?? 8080);

    killProcessesUsingPort(PORT);

    this.#httpServerRequirers.forEach(requirer => {
      requirer(httpServer);
    } );

    mediaServer.run();
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
