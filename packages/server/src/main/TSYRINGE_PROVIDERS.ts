import { container } from "tsyringe";
import { MusicFixController } from "#musics/controllers/FixController";
import { MusicUpdateRemoteController } from "#musics/controllers/UpdateRemoteController";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { MusicRepository } from "#musics/repositories";
import { EpisodeAddNewFilesController, EpisodeRepository, EpisodeRestController, SavedSerieTreeService } from "#episodes/index";
import { ActionController } from "#modules/actions";
import { EpisodePickerController, EpisodePickerService } from "#modules/episode-picker";
import { FileInfoRepository as EpisodeFileInfoRepository } from "#modules/file-info";
import { HistoryEntryRepository, HistoryListRepository, HistoryListRestController, HistoryListService } from "#modules/historyLists";
import { PlaySerieController, PlayStreamController, RemotePlayerWebSocketsServerService, VlcBackWebSocketsServerService } from "#modules/play";
import { SerieRepository } from "#modules/series";
import { StreamRestController } from "#modules/streams";

container
  .registerSingleton(DomainMessageBroker)
  .registerSingleton(EpisodeFileInfoRepository)
  .registerSingleton(EpisodeRepository)
  .registerSingleton(EpisodePickerService)

  .registerSingleton(MusicRepository)

  .registerSingleton(SerieRepository)
  .registerSingleton(SavedSerieTreeService)

  .registerSingleton(HistoryEntryRepository)
  .registerSingleton(HistoryListRepository)
  .registerSingleton(HistoryListService)

  .registerSingleton(VlcBackWebSocketsServerService)
  .registerSingleton(RemotePlayerWebSocketsServerService)

  .registerSingleton(PlaySerieController)
  .registerSingleton(EpisodeRestController)
  .registerSingleton(StreamRestController)
  .registerSingleton(StreamRestController)
  .registerSingleton(EpisodeAddNewFilesController)
  .registerSingleton(ActionController)
  .registerSingleton(HistoryListService)
  .registerSingleton(PlayStreamController)
  .registerSingleton(EpisodePickerController)
  .registerSingleton(HistoryListRestController);

// TODO: Temporal!
export const TSYRINGE_PROVIDERS = [
  {
    provide: DomainMessageBroker,
    useFactory: () => container.resolve(DomainMessageBroker),
  },
  {
    provide: MusicRepository,
    useFactory: () => {
      let ret = container.resolve(MusicRepository);

      return ret;
    },
  },
  {
    provide: MusicFixController,
    useFactory: () => container.resolve(MusicFixController),
  },
  {
    provide: MusicUpdateRemoteController,
    useFactory: () => container.resolve(MusicUpdateRemoteController),
  },
];
