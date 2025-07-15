import { Global, Module } from "@nestjs/common";
import { StreamsModule } from "#modules/streams/module";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { SeriesModule } from "#modules/series/module";
import { EpisodesModule } from "#episodes/module";
import { EpisodePickerModule } from "#modules/episode-picker/module";
import { PlaySerieController } from "./play-serie.controller";
import { PlayStreamController } from "./play-stream.controller";
import { VlcBackWSService } from "./player-services/vlc-back/VlcBackWSServerService";
import { FrontWSServerService } from "./player-services/front/FrontPlayerWebSocketsServerService";
import { PlayService } from "./PlayService";

@Global() // Para que use sólo una instancia de servicio backend de web sockets
@Module( {
  imports: [
    StreamsModule,
    SeriesModule,
    EpisodesModule,
    EpisodePickerModule,
  ],
  controllers: [
    PlaySerieController,
    PlayStreamController,
  ],
  providers: [
    DomainMessageBroker,
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
