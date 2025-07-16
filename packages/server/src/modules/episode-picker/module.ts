import { Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { StreamsModule } from "#modules/streams/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { EpisodesModule } from "#episodes/module";
import { EpisodePickerController } from "./controller";
import { EpisodePickerService } from "./service";

@Module( {
  imports: [
    StreamsModule,
    EpisodesModule,
    EpisodeHistoryEntriesModule,
    SeriesModule,
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
