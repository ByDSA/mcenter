/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { SerieRepository } from "#modules/series/repositories";
import { DomainEventEmitterModule } from "#modules/domain-event-emitter/module";
import { SeriesModule } from "#modules/series/module";
import { EpisodesUpdateLastTimePlayedController } from "./controllers/episodes-update-lastTimePlayed.controller";
import { EpisodesRestController } from "./controllers/rest.controller";
import { EpisodesRepository } from "./repositories/repository";
import { UpdateMetadataProcess } from "./file-info/update/update-saved-process";
import { RemoteSeriesTreeService } from "./file-info/series-tree/remote/service";
import { EpisodeAddNewFilesController } from "./file-info/series-tree/add-new-files/controller";
import { EpisodesUpdateController } from "./file-info/update/controller";
import { EpisodeHistoryEntriesModule } from "./history/module";
import { EpisodeFileInfosModule } from "./file-info/module";
import { AddNewFilesRepository } from "./file-info/series-tree/add-new-files/repository";
import { EpisodeDependenciesModule } from "./dependencies/module";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesModule,
    forwardRef(() => EpisodeHistoryEntriesModule),
    EpisodeFileInfosModule,
    EpisodeDependenciesModule,
  ],
  controllers: [
    EpisodesUpdateLastTimePlayedController,
    EpisodesUpdateController,
    EpisodeAddNewFilesController,
    EpisodesRestController, // Se pone al final para que no tenga conflicto con otras urls
  ],
  providers: [
    EpisodesRepository,
    SerieRepository,
    RemoteSeriesTreeService,
    UpdateMetadataProcess,
    AddNewFilesRepository,
  ],
  exports: [EpisodesRepository],
} )
export class EpisodesModule {}
