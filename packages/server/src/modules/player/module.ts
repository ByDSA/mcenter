import { Global, Module } from "@nestjs/common";
import { EpisodePickerModule } from "#modules/episode-picker/module";
import { SeriesModule } from "#modules/series/module";
import { StreamsModule } from "#modules/streams/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { EpisodeFileInfosModule } from "#episodes/file-info/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { MusicHistoryModule } from "#musics/history/module";
import { MusicsCrudModule } from "#musics/crud/module";
import { MusicFileInfoModule } from "#musics/file-info/module";
import { PlayVideoService } from "./play-video.service";
import { FrontWSServerService } from "./player-services/front/front-player-web-sockets-server.service";
import { VlcBackWSService } from "./player-services/vlc-back/vlc-back-ws-server.service";
import { PlayStreamController } from "./play-stream/controller";
import { PlayEpisodeController } from "./play-episode/controller";
import { PlayMusicController } from "./play-music/controller";
import { PlayService } from "./play.service";
import { PlayMusicService } from "./play-music/service";

@Global() // Para que use sólo una instancia de servicio backend de web sockets
@Module( {
  imports: [
    DomainEventEmitterModule,
    StreamsModule,
    SeriesModule,
    EpisodesCrudModule,
    EpisodeHistoryModule,
    EpisodePickerModule,
    EpisodeFileInfosModule,
    MusicsCrudModule,
    MusicHistoryModule,
    MusicFileInfoModule,
  ],
  controllers: [
    PlayEpisodeController,
    PlayMusicController,
    PlayStreamController,
  ],
  providers: [
    FrontWSServerService,
    PlayService,
    PlayVideoService,
    PlayMusicService,
    VlcBackWSService,
  ],
  exports: [
    FrontWSServerService,
    VlcBackWSService,
  ],
} )
export class PlayerModule {}
