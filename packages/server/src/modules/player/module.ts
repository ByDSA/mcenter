import { Global, Module } from "@nestjs/common";
import { EpisodePickerModule } from "#modules/episode-picker/module";
import { EpisodesModule } from "#episodes/module";
import { SeriesModule } from "#modules/series/module";
import { StreamsModule } from "#modules/streams/module";
import { DomainEventEmitterModule } from "#main/domain-event-emitter/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { EpisodeFileInfosModule } from "#episodes/file-info/module";
import { PlayService } from "./play.service";
import { FrontWSServerService } from "./player-services/front/front-player-web-sockets-server.service";
import { VlcBackWSService } from "./player-services/vlc-back/vlc-back-ws-server.service";
import { PlayStreamController } from "./play-stream.controller";
import { PlaySerieController } from "./play-serie.controller";

@Global() // Para que use sólo una instancia de servicio backend de web sockets
@Module( {
  imports: [
    DomainEventEmitterModule,
    StreamsModule,
    SeriesModule,
    EpisodesModule,
    EpisodeHistoryEntriesModule,
    EpisodePickerModule,
    EpisodeFileInfosModule,
  ],
  controllers: [
    PlaySerieController,
    PlayStreamController,
  ],
  providers: [
    FrontWSServerService,
    PlayService,
    VlcBackWSService,
  ],
  exports: [
    FrontWSServerService,
    VlcBackWSService,
  ],
} )
export class PlayerModule {}
