import { forwardRef, Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { SeriesRepository } from "#modules/series/crud/repository";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { UpdateMetadataProcess } from "../file-info/update/update-saved-process";
import { EpisodeAddNewFilesController } from "../file-info/series-tree/add-new-files/controller";
import { EpisodesUpdateController } from "../file-info/update/controller";
import { EpisodeHistoryModule } from "../history/module";
import { EpisodeFileInfosModule } from "../file-info/module";
import { AddNewFilesRepository } from "../file-info/series-tree/add-new-files/repository";
import { EpisodeDependenciesModule } from "../dependencies/module";
import { EpisodesCrudModule } from "../crud/module";
import { EpisodesUpdateLastTimePlayedController } from "./update-last-time-played/controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesModule,
    forwardRef(() => EpisodeHistoryModule),
    EpisodeFileInfosModule,
    EpisodeDependenciesModule,
    ResourceResponseFormatterModule,
    EpisodesCrudModule,
  ],
  controllers: [
    EpisodesUpdateLastTimePlayedController,
    EpisodesUpdateController,
    EpisodeAddNewFilesController,
  ],
  providers: [
    SeriesRepository,
    UpdateMetadataProcess,
    AddNewFilesRepository,
  ],
  exports: [],
} )
export class EpisodesAdminModule {}
