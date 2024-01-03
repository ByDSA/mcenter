import { ExpressApp } from "#main";
import { ExpressAppDependencies } from "#main/ExpressApp";
import ActionController from "#modules/actions/ActionController";
import { ActionControllerMock } from "#modules/actions/test";
import { EpisodeRestController } from "#modules/episodes";
import { EpisodeRestControllerMock } from "#modules/episodes/controllers/test";
import { HistoryListRestController } from "#modules/historyLists";
import { HistoryListRestControllerMock } from "#modules/historyLists/controllers/test";
import { MusicController } from "#modules/musics";
import { MusicControllerMock } from "#modules/musics/controllers/tests";
import { PickerController } from "#modules/picker";
import { PickerControllerMock } from "#modules/picker/tests";
import { PlaySerieController, PlayStreamController, RemotePlayerController } from "#modules/play";
import WebSocketsFrontServerService from "#modules/play/remote-player/RemoteFrontPlayerWebSocketsServerService";
import { PlayStatusControllerMock, WebSocketsServiceMock } from "#modules/play/remote-player/tests";
import { PlaySerieControllerMock, PlayStreamControllerMock } from "#modules/play/tests";
import { StreamRestController } from "#modules/streams";
import { StreamRestControllerMock } from "#modules/streams/controllers/test";
import { TestMongoDatabase } from "./db";
import TestDatabase from "./db/TestDatabase";
import { registerSingletonIfNotAndGet } from "./utils";

export default class ExpressAppMock extends ExpressApp {
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
  registerSingletonIfNotAndGet(PickerController, PickerControllerMock);
  registerSingletonIfNotAndGet(HistoryListRestController, HistoryListRestControllerMock);
  registerSingletonIfNotAndGet(MusicController, MusicControllerMock);
  registerSingletonIfNotAndGet(PlaySerieController, PlaySerieControllerMock);
  registerSingletonIfNotAndGet(PlayStreamController, PlayStreamControllerMock);
  registerSingletonIfNotAndGet(RemotePlayerController, PlayStatusControllerMock);
  registerSingletonIfNotAndGet(WebSocketsFrontServerService, WebSocketsServiceMock);
  registerSingletonIfNotAndGet(ActionController, ActionControllerMock);
  registerSingletonIfNotAndGet(StreamRestController, StreamRestControllerMock);
  registerSingletonIfNotAndGet(EpisodeRestController, EpisodeRestControllerMock);
}