import { Module } from "@nestjs/common";
import { MusicHistoryRepository } from "./repositories";
import { MusicHistoryRestController } from "./controllers/rest.controller";
import { MusicRepository } from "#musics/repositories";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";

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
