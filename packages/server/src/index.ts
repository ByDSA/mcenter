import "reflect-metadata";

import ActionController from "#modules/actions/ActionController";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodePickerController, EpisodePickerService } from "#modules/episode-picker";
import { EpisodeFileInfoRepository, EpisodeRepository, EpisodeRestController } from "#modules/episodes";
import { AddNewFilesController } from "#modules/episodes/file-info/add-new-files";
import { HistoryEntryRepository, HistoryListRepository, HistoryListRestController, HistoryListService } from "#modules/historyLists";
import { MusicController } from "#modules/musics";
import { PlaySerieController, PlayStreamController, RemotePlayerController } from "#modules/play";
import { RemoteFrontPlayerWebSocketsServerService } from "#modules/play/remote-player";
import { VlcBackWebSocketsServerService } from "#modules/play/remote-player/vlc-back-service";
import { SerieRepository } from "#modules/series";
import { SavedSerieTreeService } from "#modules/series/saved-serie-tree-service";
import { StreamRestController } from "#modules/streams";
import { container } from "tsyringe";
import { ExpressApp } from "./main";
import RealDatabase from "./main/db/Database";

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

    .registerSingleton(RemoteFrontPlayerWebSocketsServerService)

    .registerSingleton(RemotePlayerController)
    .registerSingleton(PlaySerieController)
    .registerSingleton(EpisodeRestController)
    .registerSingleton(MusicController)
    .registerSingleton(StreamRestController)
    .registerSingleton(StreamRestController)
    .registerSingleton(AddNewFilesController)
    .registerSingleton(ActionController)
    .registerSingleton(HistoryListService)
    .registerSingleton(PlayStreamController)
    .registerSingleton(EpisodePickerController)
    .registerSingleton(HistoryListRestController);

  const app: ExpressApp = new ExpressApp( {
    db: {
      instance: new RealDatabase(),
    },
    controllers: {
      cors: true,
    },
  } );

  container.registerInstance(ExpressApp, app);

  await app.init();
  app.listen();
} )();