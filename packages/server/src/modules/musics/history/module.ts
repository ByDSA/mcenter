/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#modules/domain-event-emitter/module";
import { MusicsModule } from "../module";
import { MusicHistoryRepository } from "./repositories";
import { MusicHistoryRestController } from "./controllers/rest.controller";

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
