import { Module } from "@nestjs/common";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { MusicsHistoryModule } from "./history/controllers/module";
import { MusicGetController } from "./controllers/get.controller";
import { MusicFixController } from "./controllers/fix.controller";
import { UpdateRemoteTreeService } from "./services";
import { MusicRestController } from "./controllers/rest.controller";
import { MusicUpdateRemoteController } from "./controllers/update-remote.controller";
import { MusicRepository } from "./repositories";

@Module( {
  imports: [
    MusicsHistoryModule,
  ],
  controllers: [
    MusicRestController,
    MusicGetController,
    MusicFixController,
    MusicUpdateRemoteController,
  ],
  providers: [
    DomainMessageBroker,
    MusicRepository,
    UpdateRemoteTreeService,
  ],
  exports: [],
} )
export class MusicsModule {}
