import ActionController from "#modules/actions/ActionController";
import { EpisodeRepository, EpisodeRestController } from "#modules/episodes";
import EpisodePickerService from "#modules/episodes/EpisodePicker/EpisodePickerService";
import { HistoryListRepository, HistoryListRestController } from "#modules/historyLists";
import { PickerController } from "#modules/picker";
import { PlaySerieController, PlayStreamController, RemotePlayerController } from "#modules/play";
import { RemotePlayerWebSocketsService } from "#modules/play/remote-player";
import { SerieRelationshipWithStreamFixer, SerieRepository } from "#modules/series";
import { StreamRepository, StreamRestController } from "#modules/streams";
import { deepFreeze, deepMerge } from "#shared/utils/objects";
import { OptionalPropsRecursive, PublicMethodsOf } from "#shared/utils/types";
import { assertIsDefined, isDefined } from "#shared/utils/validation";
import { App, HELLO_WORLD_HANDLER, errorHandler } from "#utils/express";
import ForbiddenError from "#utils/http/validation/ForbiddenError";
import { Database } from "#utils/layers/db";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import schedule from "node-schedule";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { Server } from "node:http";
import serveIndex from "serve-index";

export type ExpressAppDependencies = {
  db: {
    instance: Database;
  };
  modules: {
    play: {
      playSerieController: PublicMethodsOf<PlaySerieController>;
      playStreamController: PublicMethodsOf<PlayStreamController>;
      remotePlayer: {
      controller: PublicMethodsOf<RemotePlayerController>;
      webSocketsService: PublicMethodsOf<RemotePlayerWebSocketsService>;
      };
    };
    picker: {
      controller: PublicMethodsOf<PickerController>;
    };
    actionController: PublicMethodsOf<ActionController>;
    historyList: {
      restController: PublicMethodsOf<HistoryListRestController>;
    };
    streams: {
      restController: PublicMethodsOf<StreamRestController>;
    };
    episodes: {
      restController: PublicMethodsOf<EpisodeRestController>;
    };
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
export default class ExpressApp implements App {
  #instance: express.Express | null = null;

  httpServer: Server | undefined;

  #dependencies: Required<ExpressAppDependencies>;

  constructor(dependencies: ExpressAppDependencies) {
    this.#dependencies = deepMerge(DEFAULT_DEPENDENCIES as Required<ExpressAppDependencies>, dependencies);
  }

  async init() {
    const db = this.#dependencies.db.instance;

    if (db) {
      db.init();
      await db.connect();
    }

    const app = express();

    // eslint-disable-next-line global-require
    require("../scheduler");

    app.disable("x-powered-by");

    app.use(helmet());

    const requestLogger = (
      request: Request,
      _: Response,
      next: NextFunction) => {
      console.log(`[${request.method}] ${request.url}`);
      next();
    };

    app.use(requestLogger);

    if (this.#dependencies.controllers.cors) {
      const {FRONTEND_URL} = process.env;

      assertIsDefined(FRONTEND_URL);
      const whitelist: string[] = [FRONTEND_URL];

      app.use(cors( {
        preflightContinue: true,
        origin(origin, callback) {
          const allowsAnyOrigin = true;
          const originUrl = origin ? new URL(origin) : null;
          const originIsLocal = originUrl && (originUrl.hostname === "localhost" || originUrl.hostname.startsWith("192.168."));
          const allows = (origin && (whitelist.includes(origin) || originIsLocal)) || allowsAnyOrigin;

          if (allows)
            callback(null, true);
          else
            callback(new ForbiddenError("Not allowed by CORS"));
        },
      } ));
    }

    if (process.env.NODE_ENV === "development")
      app.get("/", HELLO_WORLD_HANDLER);

    const {playSerieController, playStreamController, remotePlayer} = this.#dependencies.modules.play;
    const {controller: remotePlayerController} = remotePlayer;

    app.use("/api/play/serie", playSerieController.getRouter());
    app.use("/api/play/stream", playStreamController.getRouter());
    app.use("/api/player/remote", remotePlayerController.getRouter());

    const {controller: pickerController} = this.#dependencies.modules.picker;

    app.use("/api/picker", pickerController.getRouter());

    app.use("/api/actions", this.#dependencies.modules.actionController.getRouter());

    app.use("/api/history-list", this.#dependencies.modules.historyList.restController.getRouter());

    app.use("/api/streams", this.#dependencies.modules.streams.restController.getRouter());

    app.use("/api/episodes", this.#dependencies.modules.episodes.restController.getRouter());

    app.get("/api/test/picker/:idstream", async (req: Request, res: Response) => {
      const { idstream } = req.params;
      const streamRepository = new StreamRepository();
      const serieRelationshipWithStreamFixer = new SerieRelationshipWithStreamFixer( {
        streamRepository,
      } );
      const episodePickerService = new EpisodePickerService( {
        streamRepository,
        episodeRepository: new EpisodeRepository(),
        serieRepository: new SerieRepository( {
          relationshipWithStreamFixer: serieRelationshipWithStreamFixer,
        } ),
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
        app.use(`/raw/${item}/`, express.static(`${mediaFolderPath}/${item}/`, {
          acceptRanges: false, // Evita que a veces salga el error de "Range Not Satisfiable"
        } ), serveIndex(`${mediaFolderPath}/${item}/`, {
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
    await this.#dependencies.db.instance.disconnect();

    schedule.gracefulShutdown();
  }

  listen() {
    assertIsDefined(this.#instance);
    const PORT: number = +(process.env.PORT ?? 8080);

    killProcessesUsingPort(PORT);
    this.httpServer = this.#instance.listen(PORT, () => {
      const address = (this.httpServer as Server).address();
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