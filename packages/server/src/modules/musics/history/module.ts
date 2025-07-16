import { Module } from "@nestjs/common";
import { MusicRepository } from "#musics/repositories";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";
import { MusicHistoryRepository } from "./repositories";
import { MusicHistoryRestController } from "./controllers/rest.controller";

@Module( {
  imports: [DomainMessageBrokerModule],
  controllers: [MusicHistoryRestController],
  providers: [
    MusicRepository,
    MusicHistoryRepository,
  ],
  exports: [MusicHistoryRepository],
} )
export class MusicsHistoryModule {}
