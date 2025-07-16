import { Module } from "@nestjs/common";
import { MusicsHistoryModule } from "./history/module";
import { MusicGetController } from "./controllers/get.controller";
import { MusicFixController } from "./controllers/fix.controller";
import { UpdateRemoteTreeService } from "./services";
import { MusicRestController } from "./controllers/rest.controller";
import { MusicUpdateRemoteController } from "./controllers/update-remote.controller";
import { MusicRepository } from "./repositories";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";

@Module( {
  imports: [
    MusicsHistoryModule,
    DomainMessageBrokerModule,
  ],
  controllers: [
    MusicRestController,
    MusicGetController,
    MusicFixController,
    MusicUpdateRemoteController,
  ],
  providers: [
    MusicRepository,
    UpdateRemoteTreeService,
  ],
  exports: [],
} )
export class MusicsModule {}
