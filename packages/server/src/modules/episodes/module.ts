/* eslint-disable import/no-cycle */
import { Module } from "@nestjs/common";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeFileInfoRepository } from "#modules/file-info/repositories";
import { SerieRepository } from "#modules/series";
import { EpisodesRestController } from "./controllers/rest.controller";
import { EpisodesRepository } from "./repositories";
import { EpisodeHistoryEntriesModule } from "./history/module";
import { UpdateMetadataProcess } from "./update/UpdateSavedProcess";
import { SavedSerieTreeService } from "./saved-serie-tree-service";

@Module( {
  imports: [
    EpisodeHistoryEntriesModule,
  ],
  controllers: [
    EpisodesRestController,
  ],
  providers: [
    DomainMessageBroker,
    EpisodesRepository,
    EpisodeFileInfoRepository,
    SerieRepository,
    SavedSerieTreeService,
    UpdateMetadataProcess,
  ],
  exports: [EpisodesRepository, EpisodeHistoryEntriesModule, UpdateMetadataProcess],
} )
export class EpisodesModule {}
