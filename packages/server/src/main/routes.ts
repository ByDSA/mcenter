import { RouterModule } from "@nestjs/core";
import { PATH_ROUTES } from "$shared/routing";
import { MusicsModule } from "#musics/module";
import { MusicsHistoryModule } from "#musics/history/module";
import { ActionsModule } from "#modules/actions/actions.module";
import { EpisodesModule } from "#episodes/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { EpisodePickerModule } from "#modules/episode-picker/module";
import { StreamsModule } from "#modules/streams/module";
import { PlayerModule } from "#modules/player/module";

export const routeModules = [
  MusicsModule,
  ActionsModule,
  EpisodesModule,
  EpisodeHistoryEntriesModule,
  EpisodePickerModule,
  StreamsModule,
  PlayerModule,
  RouterModule.register([
    {
      path: PATH_ROUTES.musics.path,
      module: MusicsModule,
    },
    {
      path: PATH_ROUTES.musics.history.path,
      module: MusicsHistoryModule,
    },
    {
      path: PATH_ROUTES.actions.path,
      module: ActionsModule,
    },
    {
      path: PATH_ROUTES.episodes.path,
      module: EpisodesModule,
    },
    {
      path: PATH_ROUTES.episodes.history.path,
      module: EpisodeHistoryEntriesModule,
    },
    {
      path: PATH_ROUTES.episodes.picker.path,
      module: EpisodePickerModule,
    },
    {
      path: PATH_ROUTES.streams.path,
      module: StreamsModule,
    },
    {
      path: PATH_ROUTES.player.path,
      module: PlayerModule,
    },
  ]),
];
