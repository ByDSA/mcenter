import "reflect-metadata";

import { ActionController } from "#modules/actions";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodePickerController, EpisodePickerService } from "#modules/episode-picker";
import { EpisodeAddNewFilesController, EpisodeRepository, EpisodeRestController, SavedSerieTreeService } from "#modules/episodes";
import { FileInfoRepository as EpisodeFileInfoRepository } from "#modules/file-info";
import { HistoryEntryRepository, HistoryListRepository, HistoryListRestController, HistoryListService } from "#modules/historyLists";
import { MusicController } from "#modules/musics";
import { PlaySerieController, PlayStreamController, RemotePlayerController, RemotePlayerWebSocketsServerService, VlcBackWebSocketsServerService } from "#modules/play";
import { SerieRepository } from "#modules/series";
import { StreamRestController } from "#modules/streams";
import { container } from "tsyringe";
import { ExpressApp, RealMongoDatabase } from "./main";

(async function main() {
  container
    .registerSingleton(DomainMessageBroker)
    .registerSingleton(EpisodeFileInfoRepository)
    .registerSingleton(EpisodeRepository)
    .registerSingleton(EpisodePickerService)

    .registerSingleton(SerieRepository)
    .registerSingleton(SavedSerieTreeService)

    .registerSingleton(HistoryEntryRepository)
    .registerSingleton(HistoryListRepository)
    .registerSingleton(HistoryListService)

    .registerSingleton(VlcBackWebSocketsServerService)
    .registerSingleton(RemotePlayerWebSocketsServerService)

    .registerSingleton(RemotePlayerController)
    .registerSingleton(PlaySerieController)
    .registerSingleton(EpisodeRestController)
    .registerSingleton(MusicController)
    .registerSingleton(StreamRestController)
    .registerSingleton(StreamRestController)
    .registerSingleton(EpisodeAddNewFilesController)
    .registerSingleton(ActionController)
    .registerSingleton(HistoryListService)
    .registerSingleton(PlayStreamController)
    .registerSingleton(EpisodePickerController)
    .registerSingleton(HistoryListRestController);

  const app: ExpressApp = new ExpressApp( {
    db: {
      instance: new RealMongoDatabase(),
    },
    controllers: {
      cors: true,
    },
  } );
  const vlcBackWebSocketsServerService = container.resolve(VlcBackWebSocketsServerService);
  const remotePlayerWebSocketsServerService = container.resolve(RemotePlayerWebSocketsServerService);

  app.onHttpServerListen((server) => {
    vlcBackWebSocketsServerService.startSocket(server);
    remotePlayerWebSocketsServerService.startSocket(server);
  } );

  container.registerInstance(ExpressApp, app);

  await app.init();
  app.listen();
} )();