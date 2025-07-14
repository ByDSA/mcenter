import { Module } from "@nestjs/common";
import { MusicRepository } from "#musics/repositories";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { MusicHistoryRepository } from "../repositories";
import { MusicHistoryRestController } from "./rest.controller";

@Module( {
  imports: [],
  controllers: [MusicHistoryRestController],
  providers: [
    DomainMessageBroker,
    MusicRepository,
    MusicHistoryRepository,
  ],
  exports: [MusicHistoryRepository],
} )
export class MusicsHistoryModule {}
