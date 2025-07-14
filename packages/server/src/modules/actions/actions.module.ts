import { Module } from "@nestjs/common";
import { EpisodeAddNewFilesController, EpisodeRepository, EpisodeUpdateController, SavedSerieTreeService } from "#episodes/index";
import { HistoryListRepository, LastTimePlayedService } from "#modules/historyLists";
import { SerieRepository } from "#modules/series";
import { StreamsRepository } from "#modules/streams/repositories/Repository";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeFileInfoRepository } from "#modules/file-info/repositories";
import { UpdateMetadataProcess } from "#episodes/update/UpdateSavedProcess";
import { FixerController } from "./fixer.controller";
import { EpisodesUpdateLastTimePlayedController } from "./episodes-update-lastTimePlayed.controller";
import { ActionController } from "./main.controller";

@Module( {
  imports: [
  ],
  controllers: [
    ActionController,
    EpisodesUpdateLastTimePlayedController,
    EpisodeUpdateController,
    EpisodeAddNewFilesController,
    FixerController,
  ],
  providers: [
    // EpisodesUpdateLastTimePlayedController :
    LastTimePlayedService,
    SerieRepository,
    EpisodeRepository,
    HistoryListRepository,
    StreamsRepository,
    // EpisodeRepository:
    DomainMessageBroker,
    EpisodeFileInfoRepository,
    // EpisodeUpdateController:
    UpdateMetadataProcess,
    // UpdateMetadataProcess:
    SavedSerieTreeService,
  ],
} )
export class ActionsModule {
}
