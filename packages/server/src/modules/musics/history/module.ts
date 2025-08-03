/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicsModule } from "../module";
import { MusicHistoryRepository } from "./rest/repository";
import { MusicHistoryRestController } from "./rest/controller";

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
