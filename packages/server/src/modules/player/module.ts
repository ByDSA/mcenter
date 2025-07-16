import { Global, Module } from "@nestjs/common";
import { PlaySerieController } from "./play-serie.controller";
import { PlayStreamController } from "./play-stream.controller";
import { VlcBackWSService } from "./player-services/vlc-back/VlcBackWSServerService";
import { FrontWSServerService } from "./player-services/front/FrontPlayerWebSocketsServerService";
import { PlayService } from "./PlayService";
import { EpisodePickerModule } from "#modules/episode-picker/module";
import { EpisodesModule } from "#episodes/module";
import { SeriesModule } from "#modules/series/module";
import { StreamsModule } from "#modules/streams/module";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";

@Global() // Para que use sólo una instancia de servicio backend de web sockets
@Module( {
  imports: [
    DomainMessageBrokerModule,
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
