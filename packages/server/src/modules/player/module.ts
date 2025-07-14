import { Global, Module } from "@nestjs/common";
import { PlaySerieController } from "./play-serie.controller";
import { PlayStreamController } from "./play-stream.controller";
import { VlcBackWSService } from "./player-services/vlc-back/VlcBackWSServerService";

@Global() // Para que use sólo una instancia de servicio backend de web sockets
@Module( {
  imports: [
  ],
  controllers: [
    PlaySerieController,
    PlayStreamController,
  ],
  providers: [
    ...PlaySerieController.providers,
    ...PlayStreamController.providers,
  ],
  exports: [
    VlcBackWSService,
  ],
} )
export class PlayerModule {}
