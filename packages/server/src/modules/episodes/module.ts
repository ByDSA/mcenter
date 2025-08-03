/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { SerieRepository } from "#modules/series/rest/repository";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesUpdateLastTimePlayedController } from "./actions/episodes-update-lastTimePlayed.controller";
import { EpisodesRestController } from "./rest/controller";
import { EpisodesRepository } from "./rest/repository";
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
