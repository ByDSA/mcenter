/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";
import { MusicsModule } from "../module";
import { MusicHistoryRepository } from "./repositories";
import { MusicHistoryRestController } from "./controllers/rest.controller";

@Module( {
  imports: [
    DomainMessageBrokerModule,
    forwardRef(() => MusicsModule),
  ],
  controllers: [MusicHistoryRestController],
  providers: [
    MusicHistoryRepository,
  ],
  exports: [MusicHistoryRepository],
} )
export class MusicsHistoryModule {}
