import { Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { StreamsModule } from "#modules/streams/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { EpisodesModule } from "#episodes/module";
import { EpisodeDependenciesModule } from "#episodes/dependencies/module";
import { EpisodePickerController } from "./controller";
import { EpisodePickerService } from "./service";

@Module( {
  imports: [
    StreamsModule,
    EpisodesModule,
    EpisodeHistoryModule,
    SeriesModule,
    EpisodeDependenciesModule,
  ],
  controllers: [
    EpisodePickerController,
  ],
  providers: [
    EpisodePickerService,
  ],
  exports: [EpisodePickerService],
} )
export class EpisodePickerModule {}
