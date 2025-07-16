import { Module } from "@nestjs/common";
import { EpisodesRestController } from "./controllers/rest.controller";
import { EpisodesRepository } from "./repositories";
import { EpisodeHistoryEntriesModule } from "./history/module";
import { UpdateMetadataProcess } from "./update/UpdateSavedProcess";
import { SavedSerieTreeService } from "./saved-serie-tree-service";
import { SerieRepository } from "#modules/series/repositories";
import { EpisodeFileInfoRepository } from "#modules/file-info/repositories";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";

@Module( {
  imports: [
    DomainMessageBrokerModule,
    EpisodeHistoryEntriesModule,
  ],
  controllers: [
    EpisodesRestController,
  ],
  providers: [
    EpisodesRepository,
    EpisodeFileInfoRepository,
    SerieRepository,
    SavedSerieTreeService,
    UpdateMetadataProcess,
  ],
  exports: [EpisodesRepository, EpisodeHistoryEntriesModule, UpdateMetadataProcess],
} )
export class EpisodesModule {}
