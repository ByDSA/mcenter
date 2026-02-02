import { Module } from "@nestjs/common";
import { SeriesCrudModule } from "#episodes/series/module";
import { StreamsModule } from "#episodes/streams/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { EpisodeDependenciesModule } from "#episodes/dependencies/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodeFileInfosModule } from "#episodes/file-info/module";
import { EpisodeRendererModule } from "#episodes/renderer/module";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { StreamPickerController } from "./show-picker.controller";
import { StreamGetRandomEpisodeService } from "./get-episode.service";
import { StreamGetEpisodeController } from "./get-episode.controller";

@Module( {
  imports: [
    StreamsModule,
    EpisodesCrudModule,
    EpisodeHistoryModule,
    SeriesCrudModule,
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
