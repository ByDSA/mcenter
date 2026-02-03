import { RouterModule, Routes } from "@nestjs/core";
import { PATH_ROUTES } from "$shared/routing";
import { EpisodeFileInfosModule } from "#episodes/file-info/module";
import { MusicHistoryModule } from "#musics/history/module";
import { EpisodesAdminModule } from "#episodes/admin/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { StreamPickerModule } from "#episodes/streams/picker/module";
import { StreamsModule } from "#episodes/streams/module";
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
import { MusicFileInfoCrudModule } from "#musics/file-info/crud/module";
import { MusicsAdminModule } from "#musics/admin/module";
import { TasksModule } from "#core/tasks";
import { YoutubeImportMusicModule } from "#modules/youtube/import-music/module";
import { UsersModule } from "#core/auth/users";
import { AuthModule } from "#core/auth/module";
import { AuthGoogleModule } from "#core/auth/strategies/google";
import { UsersMusicPlaylistsModule } from "#musics/users-playlists/module";
import { ImageCoversCrudModule } from "#modules/image-covers/crud/module";
import { ImageCoversAdminModule } from "#modules/image-covers/admin/module";
import { MusicSmartPlaylistsCrudModule } from "#musics/smart-playlists/crud/module";
import { MusicUsersListsModule } from "#musics/users-lists/crud/module";
import { SeriesCrudModule } from "#episodes/series/module";
import { ImageCoversUploadModule } from "#modules/image-covers/upload/module";
import { LoggingModule } from "../logging/module";
import { MusicFileInfoUploadModule } from "#musics/file-info/upload/module";

// No hace falta poner todos los modules porque hay imports internos
// y por los que se importan en AppModule
export const directImports = [
  StaticFilesModule,
  ConfigModule,
  ImageCoversCrudModule,
  ImageCoversAdminModule,

  MusicsGetRandomModule, // El primero para que "random" no se considere una UUID
  MusicsSlugModule,
  MusicsAdminModule,
  MusicHistoryModule,
  MusicFileInfoCrudModule,
  MusicFileInfoUploadModule,
  MusicPlaylistsModule,
  UsersMusicPlaylistsModule,
  MusicSmartPlaylistsCrudModule,
  MusicUsersListsModule,

  EpisodesSlugModule,
  EpisodesAdminModule,
  EpisodeFileInfosModule,
  EpisodesCrudModule, // Al final, para que no interfiera con slugs
  SeriesCrudModule,

  PlayerModule,

  TasksModule,
  YoutubeImportMusicModule,
];

/* Importante: el orden de las rutas aquí en el Register es irrelevante.
  Si hay colisiones en el acceso, cargar el módulo específico primero fuera del Register */
export const authRoutes: Routes = [
  {
    path: PATH_ROUTES.users.path,
    module: UsersModule,
  },
  {
    path: PATH_ROUTES.auth.path,
    module: AuthModule,
  },
  {
    path: PATH_ROUTES.auth.path,
    module: AuthGoogleModule,
  },
];
const episodesRoutes: Routes = [
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
    path: PATH_ROUTES.episodes.series.path,
    module: SeriesCrudModule,
  },
  {
    path: PATH_ROUTES.streams.path,
    module: StreamsModule,
  },
  {
    path: PATH_ROUTES.streams.path,
    module: StreamPickerModule,
  },
];
const musicsRoutes: Routes = [
  {
    path: PATH_ROUTES.musics.path,
    module: MusicsCrudModule,
  },
  {
    path: PATH_ROUTES.musics.fileInfo.path,
    module: MusicFileInfoCrudModule,
  },
  {
    path: PATH_ROUTES.musics.fileInfo.upload.path,
    module: MusicFileInfoUploadModule,
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
    path: PATH_ROUTES.musics.smartPlaylists.path,
    module: MusicSmartPlaylistsCrudModule,
  },
  {
    path: PATH_ROUTES.musics.usersLists.path,
    module: MusicUsersListsModule,
  },
  {
    path: PATH_ROUTES.musics.admin.path,
    module: MusicsAdminModule,
  },
];

export const routes: Routes = [
  {
    path: "/",
    module: StaticFilesModule,
  },
  {
    path: PATH_ROUTES.config.path,
    module: ConfigModule,
  },
  {
    path: PATH_ROUTES.logs.path,
    module: LoggingModule,
  },
  ...authRoutes,
  {
    path: PATH_ROUTES.imageCovers.path,
    module: ImageCoversCrudModule,
  },
  {
    path: PATH_ROUTES.imageCovers.upload.path,
    module: ImageCoversUploadModule,
  },
  {
    path: PATH_ROUTES.imageCovers.admin.path,
    module: ImageCoversAdminModule,
  },
  {
    path: "api/users",
    module: UsersMusicPlaylistsModule,
  },
  ...episodesRoutes,
  ...musicsRoutes,
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

export const routeModules = [...directImports, RouterModule.register(routes)];
