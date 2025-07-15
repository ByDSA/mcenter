import { Module } from "@nestjs/common";
import { EpisodesModule } from "#episodes/module";
import { SeriesModule } from "#modules/series/module";
import { StreamsModule } from "#modules/streams/module";
import { EpisodePickerController } from "./controller";
import { EpisodePickerService } from "./service";

@Module( {
  imports: [
    StreamsModule,
    EpisodesModule,
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
