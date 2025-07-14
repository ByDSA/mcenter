import { Module } from "@nestjs/common";
import { EpisodesModule } from "#episodes/module";
import { EpisodeHistoryListsModule } from "#modules/historyLists/module";
import { SeriesModule } from "#modules/series/module";
import { StreamsModule } from "#modules/streams/module";
import { EpisodePickerController } from "./controller";

@Module( {
  imports: [
    StreamsModule,
    EpisodesModule,
    EpisodeHistoryListsModule,
    SeriesModule,
  ],
  controllers: [
    EpisodePickerController,
  ],
  providers: [
  ],
  exports: [],
} )
export class EpisodePickerModule {}
