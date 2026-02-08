import { Module } from "@nestjs/common";
import { SeriesCrudModule } from "#episodes/series/crud/module";
import { StreamsCrudModule } from "#episodes/streams/crud/module";
import { EpisodeHistoryCrudModule } from "#episodes/history/crud/module";
import { EpisodeDependenciesModule } from "#episodes/dependencies/crud/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodeFileInfosCrudModule } from "#episodes/file-info/crud/module";
import { EpisodeRendererModule } from "#episodes/renderer/module";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { EpisodeLastTimePlayedModule } from "#episodes/history/last-time-played/module";
import { StreamGetEpisodeController } from "./get-episode.controller";
import { StreamGetRandomEpisodeService } from "./get-episode.service";
import { StreamPickerController } from "./show-picker.controller";

@Module( {
  imports: [
    StreamsCrudModule,
    EpisodesCrudModule,
    EpisodeHistoryCrudModule,
    EpisodeLastTimePlayedModule,
    SeriesCrudModule,
    EpisodeDependenciesModule,
    EpisodeFileInfosCrudModule,
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
