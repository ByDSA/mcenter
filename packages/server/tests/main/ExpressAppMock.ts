import { TestMongoDatabase } from "./db";
import { TestDatabase } from "./db/TestDatabase";
import { registerSingletonIfNotAndGet } from "./utils";
import { EpisodeRestControllerMock } from "#episodes/controllers/test";
import { EpisodeRestController } from "#episodes/index";
import { ExpressApp } from "#main";
import { ExpressAppDependencies } from "#main/ExpressApp";
import { ActionController } from "#modules/actions";
import { ActionControllerMock } from "#modules/actions/test";
import { EpisodePickerController } from "#modules/episode-picker";
import { EpisodePickerControllerMock } from "#modules/episode-picker/tests";
import { HistoryListRestController } from "#modules/historyLists";
import { HistoryListRestControllerMock } from "#modules/historyLists/controllers/test";
import { PlaySerieController, PlayStreamController, RemotePlayerWebSocketsServerService as WebSocketsFrontServerService } from "#modules/play";
import { WebSocketsServiceMock } from "#modules/play/player-services/tests";
import { PlaySerieControllerMock, PlayStreamControllerMock } from "#modules/play/tests";
import { StreamRestController } from "#modules/streams";
import { StreamRestControllerMock } from "#modules/streams/controllers/test";
import { MusicControllerMock } from "#musics/controllers/tests";
import { MusicController } from "#musics/index";

export class ExpressAppMock extends ExpressApp {
  #database: TestDatabase;

  constructor() {
    registerSingletons();
    const defaultRequiredDependencies: ExpressAppDependencies = {
      db: {
        instance: new TestMongoDatabase(),
      },
      controllers: {
        cors: false,
      },
    };
    const actualDependencies: ExpressAppDependencies = defaultRequiredDependencies;

    super(actualDependencies);
    this.#database = actualDependencies.db.instance as TestDatabase;
  }

  async dropDb() {
    await this.#database.drop();
  }
}

function registerSingletons() {
  registerSingletonIfNotAndGet(EpisodePickerController, EpisodePickerControllerMock);
  registerSingletonIfNotAndGet(HistoryListRestController, HistoryListRestControllerMock);
  registerSingletonIfNotAndGet(MusicController, MusicControllerMock);
  registerSingletonIfNotAndGet(PlaySerieController, PlaySerieControllerMock);
  registerSingletonIfNotAndGet(PlayStreamController, PlayStreamControllerMock);
  registerSingletonIfNotAndGet(WebSocketsFrontServerService, WebSocketsServiceMock);
  registerSingletonIfNotAndGet(ActionController, ActionControllerMock);
  registerSingletonIfNotAndGet(StreamRestController, StreamRestControllerMock);
  registerSingletonIfNotAndGet(EpisodeRestController, EpisodeRestControllerMock);
}
