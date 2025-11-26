import { PATH_ROUTES } from "$shared/routing";
import { RouterModule, Routes } from "@nestjs/core";
import { LoggingModule } from "../logging/module";
import { EpisodeFileInfosModule } from "#episodes/file-info/module";
import { MusicHistoryModule } from "#musics/history/module";
import { EpisodesAdminModule } from "#episodes/admin/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { StreamPickerModule } from "#modules/streams/picker/module";
import { StreamsModule } from "#modules/streams/module";
import { PlayerModule } from "#modules/player/module";
import { ConfigModule } from "#modules/config/config.module";
import { StaticFilesModule } from "#modules/config/static-files.module";
import { EpisodeDependenciesModule } from "#episodes/dependencies/module";
import { MusicsGetRandomModule } from "#musics/picker/module";
import { MusicPlaylistsModule } from "#musics/playlists/module";
import { MusicsSlugModule } from "#musics/slug/module";
import { MusicsCrudModule } from "#musics/crud/module";
import { EpisodesSlugModule } from "#episodes/slug/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { MusicFileInfoModule } from "#musics/file-info/module";
import { MusicsAdminModule } from "#musics/admin/module";
import { TasksModule } from "#core/tasks";
import { YoutubeImportMusicModule } from "#modules/youtube/import-music/module";
import { UsersModule } from "#core/auth/users";
import { AuthModule } from "#core/auth/module";
import { AuthGoogleModule } from "#core/auth/strategies/google";

// No hace falta poner todos los modules porque hay imports internos
// y por los que se importan en AppModule
const imports = [
  StaticFilesModule,
  ConfigModule,

  MusicsGetRandomModule, // El primero para que "random" no se considere una UUID
  MusicsSlugModule,
  MusicsAdminModule,
  MusicHistoryModule,
  MusicFileInfoModule,
  MusicPlaylistsModule,

  EpisodesSlugModule,
  EpisodesAdminModule,
  EpisodeFileInfosModule,
  EpisodesCrudModule, // Al final, para que no interfiera con slugs

  PlayerModule,

  TasksModule,
  YoutubeImportMusicModule,
];

/* Importante: el orden de las rutas aquí en el Register es irrelevante.
  Si hay colisiones en el acceso, cargar el módulo específico primero fuera del Register */
export const authRoutes: Routes = [
  {
    path: "api/users",
    module: UsersModule,
  },
  {
    path: "api/auth",
    module: AuthModule,
  },
  {
    path: "api/auth",
    module: AuthGoogleModule,
  },
];
const routes: Routes = [
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
  ...authRoutes,
  {
    path: PATH_ROUTES.episodes.path,
    module: EpisodesCrudModule,
  },
  {
    path: PATH_ROUTES.episodes.path,
    module: EpisodesAdminModule,
  },
  {
    path: PATH_ROUTES.episodes.slug.path,
    module: EpisodesSlugModule,
  },
  {
    path: PATH_ROUTES.episodes.history.path,
    module: EpisodeHistoryModule,
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
    path: PATH_ROUTES.musics.fileInfo.path,
    module: MusicFileInfoModule,
  },
  {
    path: PATH_ROUTES.musics.slug.path,
    module: MusicsSlugModule,
  },
  {
    path: PATH_ROUTES.musics.pickRandom.path,
    module: MusicsGetRandomModule,
  },
  {
    path: PATH_ROUTES.musics.playlists.path,
    module: MusicPlaylistsModule,
  },
  {
    path: PATH_ROUTES.musics.history.path,
    module: MusicHistoryModule,
  },
  {
    path: PATH_ROUTES.musics.path + "/admin",
    module: MusicsAdminModule,
  },
  {
    path: PATH_ROUTES.streams.path,
    module: StreamsModule,
  },
  {
    path: PATH_ROUTES.streams.path,
    module: StreamPickerModule,
  },
  {
    path: PATH_ROUTES.player.path,
    module: PlayerModule,
  },
  {
    path: PATH_ROUTES.tasks.path,
    module: TasksModule,
  },
  {
    path: PATH_ROUTES.youtube.import.music.path,
    module: YoutubeImportMusicModule,
  },
];

export const routeModules = [
  ...imports,
  RouterModule.register(routes),
];
