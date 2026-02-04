import { forwardRef, Module } from "@nestjs/common";
import { SeriesCrudModule } from "#episodes/series/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { TasksModule } from "#core/tasks";
import { VideoMetadataModule } from "#modules/resources/video/video-metadata/module";
import { EpisodeHistoryModule } from "../history/module";
import { EpisodeFileInfosCrudModule } from "../file-info/crud/module";
import { EpisodeDependenciesModule } from "../dependencies/module";
import { EpisodesCrudModule } from "../crud/module";
import { EpisodesUpdateController } from "./update-file-info-saved/controller";
import { EpisodesSyncDiskToDatabaseController } from "./sync-disk-to-db/controller";
import { EpisodesUpdateLastTimePlayedController } from "./update-last-time-played/controller";
import { EpisodeUpdateRemoteTaskHandler } from "./sync-disk-to-db/task.handler";
import { EpisodeUpdateLastTimePlayedTaskHandler } from "./update-last-time-played/task.handler";
import { EpisodeUpdateFileInfoSavedTaskHandler } from "./update-file-info-saved/task.handler";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesCrudModule,
    forwardRef(() => EpisodeHistoryModule),
    EpisodeFileInfosCrudModule,
    EpisodeDependenciesModule,
    ResourceResponseFormatterModule,
    EpisodesCrudModule,
    TasksModule,
    VideoMetadataModule,
  ],
  controllers: [
    EpisodesUpdateLastTimePlayedController,
    EpisodesUpdateController,
    EpisodesSyncDiskToDatabaseController,
  ],
  providers: [
    EpisodeUpdateRemoteTaskHandler,
    EpisodeUpdateFileInfoSavedTaskHandler,
    EpisodeUpdateLastTimePlayedTaskHandler,
  ],
  exports: [],
} )
export class EpisodesAdminModule {}
