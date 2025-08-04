import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicsCrudModule } from "../rest/module";
import { MusicHistoryRepository } from "./rest/repository";
import { MusicHistoryRestController } from "./rest/controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => MusicsCrudModule),
  ],
  controllers: [MusicHistoryRestController],
  providers: [
    MusicHistoryRepository,
  ],
  exports: [MusicHistoryRepository],
} )
export class MusicHistoryModule {}
