import { PATH_ROUTES } from "$shared/routing";
import { RouterModule } from "@nestjs/core";
import { EpisodeFileInfosModule } from "#episodes/file-info/module";
import { MusicHistoryModule } from "#musics/history/module";
import { EpisodesModule } from "#episodes/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { EpisodePickerModule } from "#modules/episode-picker/module";
import { StreamsModule } from "#modules/streams/module";
import { PlayerModule } from "#modules/player/module";
import { ConfigModule } from "#modules/config/config.module";
import { StaticFilesModule } from "#modules/config/static-files.module";
import { EpisodeDependenciesModule } from "#episodes/dependencies/module";
import { MusicsGetRandomModule } from "#musics/picker/module";
import { MusicsGetPlaylistsModule } from "#musics/playlists/module";
import { MusicsGetRawModule } from "#musics/raw/module";
import { MusicsCrudModule } from "#musics/crud/module";
import { LoggingModule } from "../logging/module";

export const routeModules = [
  // No hace falta poner todos los modules porque hay imports internos
  // y por los que se importan en AppModule
  StaticFilesModule,
  ConfigModule,
  EpisodeFileInfosModule,
  MusicHistoryModule,
  PlayerModule,

  MusicsGetRandomModule,
  MusicsGetPlaylistsModule,
  MusicsGetRawModule,

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
      path: PATH_ROUTES.logs.path,
      module: LoggingModule,
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
      path: PATH_ROUTES.episodes.dependencies.path,
      module: EpisodeDependenciesModule,
    },
    {
      path: PATH_ROUTES.musics.path,
      module: MusicsCrudModule,
    },
    {
      path: PATH_ROUTES.musics.raw.path,
      module: MusicsGetRawModule,
    },
    {
      path: PATH_ROUTES.musics.pickRandom.path,
      module: MusicsGetRandomModule,
    },
    {
      path: PATH_ROUTES.musics.playlists.path,
      module: MusicsGetPlaylistsModule,
    },
    {
      path: PATH_ROUTES.musics.history.path,
      module: MusicHistoryModule,
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
