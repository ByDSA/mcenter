import { Module } from "@nestjs/common";
import { TasksModule } from "#core/tasks";
import { MusicsCrudModule } from "#musics/crud/module";
import { YoutubeImportMusicController } from "./controller";
import { YoutubeImportMusicOneTaskHandler } from "./import-one.handler";
import { YoutubeDownloadMusicService } from "./youtube-download-music.service";
import { YoutubeImportMusicService } from "./service";
import { YoutubeImportMusicPlaylistTaskHandler } from "./import-playlist.handler";

@Module( {
  imports: [
    TasksModule,
    MusicsCrudModule,
  ],
  controllers: [YoutubeImportMusicController],
  providers: [
    YoutubeImportMusicOneTaskHandler,
    YoutubeImportMusicPlaylistTaskHandler,
    YoutubeDownloadMusicService,
    YoutubeImportMusicService,
  ],
} )
export class YoutubeImportMusicModule {}
