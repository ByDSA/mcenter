import { Module } from "@nestjs/common";
import { SeriesModule } from "#episodes/series/module";
import { StreamsModule } from "#episodes/streams/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { EpisodeDependenciesModule } from "#episodes/dependencies/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodeFileInfosModule } from "#episodes/file-info/module";
import { EpisodeRendererModule } from "#episodes/renderer/module";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { StreamGetEpisodeController } from "./get-episode.controller";
import { StreamGetRandomEpisodeService } from "./get-episode.service";
import { StreamPickerController } from "./picker.controller";

@Module( {
  imports: [
    StreamsModule,
    EpisodesCrudModule,
    EpisodeHistoryModule,
    SeriesModule,
    EpisodeDependenciesModule,
    EpisodeFileInfosModule,
    EpisodeRendererModule,
    ResourceResponseFormatterModule,
  ],
  controllers: [
    StreamPickerController,
    StreamGetEpisodeController,
  ],
  providers: [
    StreamGetRandomEpisodeService,
  ],
  exports: [StreamGetRandomEpisodeService],
} )
export class StreamPickerModule {}
