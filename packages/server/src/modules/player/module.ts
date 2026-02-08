import { Global, Module } from "@nestjs/common";
import { PlayVideoService } from "./play-video.service";
import { FrontWSServerService } from "./player-services/front/front-player-web-sockets-server.service";
import { VlcBackWSService } from "./player-services/vlc-back/vlc-back-ws-server.service";
import { PlayStreamController } from "./play-stream/controller";
import { PlayEpisodeController } from "./play-episode/controller";
import { PlayMusicController } from "./play-music/controller";
import { PlayService } from "./play.service";
import { PlayMusicService } from "./play-music/service";
import { RemotePlayersController } from "./remote-players.controller";
import { OnlineRemotePlayersService } from "./online-remote-players.service";
import { RemotePlayersRepository } from "./player-services/repository";
import { RemotePlayerSubscriptionsService } from "./player-services/front/subs.service";
import { AuthPlayerService } from "./AuthPlayer.service";
import { MusicFileInfoCrudModule } from "#musics/file-info/crud/module";
import { AuthModule } from "#core/auth/module";
import { MusicsCrudModule } from "#musics/crud/module";
import { MusicHistoryModule } from "#musics/history/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodeFileInfosCrudModule } from "#episodes/file-info/crud/module";
import { EpisodeHistoryCrudModule } from "#episodes/history/crud/module";
import { StreamsCrudModule } from "#episodes/streams/crud/module";
import { SeriesCrudModule } from "#episodes/series/crud/module";
import { StreamPickerModule } from "#episodes/streams/picker/module";

@Global() // Para que use sólo una instancia de servicio backend de web sockets
@Module( {
  imports: [
    DomainEventEmitterModule,
    StreamsCrudModule,
    SeriesCrudModule,
    EpisodesCrudModule,
    EpisodeHistoryCrudModule,
    StreamPickerModule,
    EpisodeFileInfosCrudModule,
    MusicsCrudModule,
    MusicHistoryModule,
    MusicFileInfoCrudModule,
    AuthModule,
  ],
  controllers: [
    PlayEpisodeController,
    PlayMusicController,
    PlayStreamController,
    RemotePlayersController,
  ],
  providers: [
    FrontWSServerService,
    PlayService,
    PlayVideoService,
    PlayMusicService,
    VlcBackWSService,
    OnlineRemotePlayersService,
    RemotePlayersRepository,
    RemotePlayerSubscriptionsService,
    AuthPlayerService,
    RemotePlayersController, // Como provider para que se pueda usar el handler de eventos
  ],
  exports: [
    FrontWSServerService,
    VlcBackWSService,
  ],
} )
export class PlayerModule {}
