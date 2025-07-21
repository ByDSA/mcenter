import { PATH_ROUTES } from "$shared/routing";
import { RouterModule } from "@nestjs/core";
import { EpisodeFileInfosModule } from "#episodes/file-info/module";
import { MusicsModule } from "#musics/module";
import { MusicsHistoryModule } from "#musics/history/module";
import { ActionsModule } from "#modules/actions/actions.module";
import { EpisodesModule } from "#episodes/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { EpisodePickerModule } from "#modules/episode-picker/module";
import { StreamsModule } from "#modules/streams/module";
import { PlayerModule } from "#modules/player/module";
import { ConfigModule } from "#modules/config/config.module";
import { StaticFilesModule } from "#modules/config/static-files.module";

export const routeModules = [
  // No hace falta poner todos los modules porque hay imports internos
  // y por los que se importan en AppModule
  StaticFilesModule,
  ConfigModule,
  EpisodeFileInfosModule,
  MusicsHistoryModule,
  ActionsModule,
  PlayerModule,

  /* Importante: el orden de las rutas aquí en el Register es irrelevante.
  Si hay colisiones en el acceso, cargar el módulo específico primero fuera del Register */
  RouterModule.register([
    {
      path: "/",
      module: StaticFilesModule,
    },
    {
      path: "/config",
      module: ConfigModule,
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
      path: PATH_ROUTES.episodes.fileInfo.path,
      module: EpisodeFileInfosModule,
    },
    {
      path: PATH_ROUTES.musics.path,
      module: MusicsModule,
    },
    {
      path: PATH_ROUTES.musics.history.path,
      module: MusicsHistoryModule,
    },
    {
      path: PATH_ROUTES.streams.path,
      module: StreamsModule,
    },
    {
      path: PATH_ROUTES.player.path,
      module: PlayerModule,
    },
    {
      path: PATH_ROUTES.actions.path,
      module: ActionsModule,
    },
  ]),
];
