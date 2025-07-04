import "reflect-metadata";

import { Server } from "node:http";
import { container } from "tsyringe";
import { NestFactory } from "@nestjs/core";
import { EpisodeAddNewFilesController, EpisodeRepository, EpisodeRestController, SavedSerieTreeService } from "#episodes/index";
import { ActionController } from "#modules/actions";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodePickerController, EpisodePickerService } from "#modules/episode-picker";
import { FileInfoRepository as EpisodeFileInfoRepository } from "#modules/file-info";
import { HistoryEntryRepository, HistoryListRepository, HistoryListRestController, HistoryListService } from "#modules/historyLists";
import { PlaySerieController, PlayStreamController, RemotePlayerWebSocketsServerService, VlcBackWebSocketsServerService } from "#modules/play";
import { SerieRepository } from "#modules/series";
import { StreamRestController } from "#modules/streams";
import { MusicController, MusicHistoryRepository, MusicRepository } from "#musics/index";
import { AppModule } from "#main/app.module";
import { ExpressApp, RealMongoDatabase } from "./main";

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async function main() {
  container
    .registerSingleton(DomainMessageBroker)
    .registerSingleton(EpisodeFileInfoRepository)
    .registerSingleton(EpisodeRepository)
    .registerSingleton(EpisodePickerService)

    .registerSingleton(MusicRepository)
    .registerSingleton(MusicHistoryRepository)

    .registerSingleton(SerieRepository)
    .registerSingleton(SavedSerieTreeService)

    .registerSingleton(HistoryEntryRepository)
    .registerSingleton(HistoryListRepository)
    .registerSingleton(HistoryListService)

    .registerSingleton(VlcBackWebSocketsServerService)
    .registerSingleton(RemotePlayerWebSocketsServerService)

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

  const legacyApp: ExpressApp = new ExpressApp( {
    db: {
      instance: new RealMongoDatabase(),
    },
    controllers: {
      cors: true,
    },
  } );
  const vlcBackWebSocketsServerService = container.resolve(VlcBackWebSocketsServerService);
  const remotePlayerWebSocketsServerService = container
    .resolve(RemotePlayerWebSocketsServerService);

  legacyApp.onHttpServerListen((server) => {
    vlcBackWebSocketsServerService.startSocket(server);
    remotePlayerWebSocketsServerService.startSocket(server);
  } );

  container.registerInstance(ExpressApp, legacyApp);

  const app = await NestFactory.create(AppModule);
  const httpAdapter = app.getHttpAdapter();

  await legacyApp.init(httpAdapter.getInstance());

  const PORT: number = +(process.env.PORT ?? 8080);
  const httpServer = await app.listen(PORT) as Server;

  await legacyApp.listen(httpServer);
} )();
