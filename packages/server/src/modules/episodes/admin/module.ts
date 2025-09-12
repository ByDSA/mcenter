import { forwardRef, Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { SeriesRepository } from "#modules/series/crud/repository";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { TasksModule } from "#core/tasks";
import { UpdateMetadataProcess } from "../file-info/update/update-saved-process";
import { EpisodesUpdateController } from "../file-info/update/controller";
import { EpisodeHistoryModule } from "../history/module";
import { EpisodeFileInfosModule } from "../file-info/module";
import { EpisodeDependenciesModule } from "../dependencies/module";
import { EpisodesCrudModule } from "../crud/module";
import { AddNewFilesRepository } from "./sync-disk-to-db/disk/repository";
import { EpisodesSyncDiskToDatabaseController } from "./sync-disk-to-db/controller";
import { EpisodesUpdateLastTimePlayedController } from "./update-last-time-played/controller";
import { EpisodeUpdateRemoteTaskHandler } from "./sync-disk-to-db/task.handler";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesModule,
    forwardRef(() => EpisodeHistoryModule),
    EpisodeFileInfosModule,
    EpisodeDependenciesModule,
    ResourceResponseFormatterModule,
    EpisodesCrudModule,
    TasksModule,
  ],
  controllers: [
    EpisodesUpdateLastTimePlayedController,
    EpisodesUpdateController,
    EpisodesSyncDiskToDatabaseController,
  ],
  providers: [
    SeriesRepository,
    UpdateMetadataProcess,
    AddNewFilesRepository,
    EpisodeUpdateRemoteTaskHandler,
  ],
  exports: [],
} )
export class EpisodesAdminModule {}
