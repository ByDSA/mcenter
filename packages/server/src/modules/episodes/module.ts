/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { SerieRepository } from "#modules/series/repositories";
import { EpisodeFileInfoRepository } from "#episodes/file-info/repositories";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";
import { SeriesModule } from "#modules/series/module";
import { EpisodesUpdateLastTimePlayedController } from "./controllers/episodes-update-lastTimePlayed.controller";
import { EpisodesRestController } from "./controllers/rest.controller";
import { EpisodesRepository } from "./repositories/repository";
import { UpdateMetadataProcess } from "./update/update-saved-process";
import { SavedSerieTreeService } from "./saved-serie-tree-service/SavedSerieTreeService";
import { EpisodeAddNewFilesController } from "./add-new-files/controller";
import { EpisodesUpdateController } from "./update/controller";
import { EpisodeHistoryEntriesModule } from "./history/module";

@Module( {
  imports: [
    DomainMessageBrokerModule,
    SeriesModule,
    forwardRef(() => EpisodeHistoryEntriesModule),
  ],
  controllers: [
    EpisodesUpdateLastTimePlayedController,
    EpisodesUpdateController,
    EpisodeAddNewFilesController,
    EpisodesRestController, // Se pone al final para que no tenga conflicto con otras urls
  ],
  providers: [
    EpisodesRepository,
    EpisodeFileInfoRepository,
    SerieRepository,
    SavedSerieTreeService,
    UpdateMetadataProcess,
  ],
  exports: [EpisodesRepository],
} )
export class EpisodesModule {}
