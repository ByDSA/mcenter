import { Module } from "@nestjs/common";
import { FixerController } from "./fixer.controller";
import { EpisodesUpdateLastTimePlayedController } from "./episodes-update-lastTimePlayed.controller";
import { ActionController } from "./main.controller";
import { SavedSerieTreeService } from "#episodes/saved-serie-tree-service";
import { EpisodeAddNewFilesController } from "#episodes/add-new-files";
import { EpisodesUpdateController } from "#episodes/update";
import { EpisodesModule } from "#episodes/module";
import { SeriesModule } from "#modules/series/module";
import { StreamsModule } from "#modules/streams/module";

@Module( {
  imports: [
    EpisodesModule,
    SeriesModule,
    StreamsModule,
  ],
  controllers: [
    ActionController,
    EpisodesUpdateLastTimePlayedController, // TODO: mover controllers a módulo de episode
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
