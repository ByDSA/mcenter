import { Module } from "@nestjs/common";
import { EpisodeFileInfosCrudModule } from "../file-info/crud/module";
import { EpisodeDependenciesModule } from "../dependencies/crud/module";
import { EpisodesCrudModule } from "../crud/module";
import { EpisodesUpdateController } from "./update-file-info-saved/controller";
import { EpisodesSyncDiskToDatabaseController } from "./sync-disk-to-db/controller";
import { EpisodesUpdateLastTimePlayedController } from "./update-last-time-played/controller";
import { EpisodeUpdateRemoteTaskHandler } from "./sync-disk-to-db/task.handler";
import { EpisodeUpdateLastTimePlayedTaskHandler } from "./update-last-time-played/task.handler";
import { EpisodeUpdateFileInfoSavedTaskHandler } from "./update-file-info-saved/task.handler";
import { EpisodesUpdateFileInfoOffloadedController } from "./update-file-info-offloaded/controller";
import { EpisodeUpdateFileInfoOffloadedTaskHandler } from "./update-file-info-offloaded/task.handler";
import { SeriesCrudModule } from "#episodes/series/crud/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { TasksModule } from "#core/tasks";
import { VideoMetadataModule } from "#modules/resources/video/video-metadata/module";
import { EpisodeLastTimePlayedModule } from "#episodes/history/last-time-played/module";
import { EpisodeResponseFormatterModule } from "#episodes/renderer/module";
import { EpisodeFileInfosSyncModule } from "#episodes/file-info/sync/module";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesCrudModule,
    EpisodeLastTimePlayedModule,
    EpisodeFileInfosCrudModule,
    EpisodeDependenciesModule,
    EpisodeResponseFormatterModule,
    EpisodesCrudModule,
    TasksModule,
    VideoMetadataModule,
    EpisodeFileInfosSyncModule,
  ],
  controllers: [
    EpisodesUpdateLastTimePlayedController,
    EpisodesUpdateController,
    EpisodesSyncDiskToDatabaseController,
    EpisodesUpdateFileInfoOffloadedController,
  ],
  providers: [
    EpisodeUpdateRemoteTaskHandler,
    EpisodeUpdateFileInfoSavedTaskHandler,
    EpisodeUpdateLastTimePlayedTaskHandler,
    EpisodeUpdateFileInfoOffloadedTaskHandler,
  ],
  exports: [],
} )
export class EpisodesAdminModule {}
