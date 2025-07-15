import { Module } from "@nestjs/common";
import { EpisodeAddNewFilesController, EpisodesUpdateController, SavedSerieTreeService } from "#episodes/index";
import { EpisodesModule } from "#episodes/module";
import { SeriesModule } from "#modules/series/module";
import { StreamsModule } from "#modules/streams/module";
import { FixerController } from "./fixer.controller";
import { EpisodesUpdateLastTimePlayedController } from "./episodes-update-lastTimePlayed.controller";
import { ActionController } from "./main.controller";

@Module( {
  imports: [
    EpisodesModule,
    SeriesModule,
    StreamsModule,
  ],
  controllers: [
    ActionController,
    EpisodesUpdateLastTimePlayedController,
    EpisodesUpdateController,
    EpisodeAddNewFilesController,
    FixerController,
  ],
  providers: [
    SavedSerieTreeService, // EpisodeAddNewFilesController
  ],
} )
export class ActionsModule {
}
