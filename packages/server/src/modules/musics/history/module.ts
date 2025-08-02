/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { MusicsModule } from "../module";
import { MusicHistoryRepository } from "./repositories";
import { MusicHistoryRestController } from "./controllers/rest.controller";
import { DomainEventEmitterModule } from "#main/domain-event-emitter/module";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => MusicsModule),
  ],
  controllers: [MusicHistoryRestController],
  providers: [
    MusicHistoryRepository,
  ],
  exports: [MusicHistoryRepository],
} )
export class MusicsHistoryModule {}
