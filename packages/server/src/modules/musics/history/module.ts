import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicHistoryRepository } from "./crud/repository";
import { MusicHistoryCrudController } from "./crud/controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => MusicsCrudModule),
  ],
  controllers: [MusicHistoryCrudController],
  providers: [
    MusicHistoryRepository,
  ],
  exports: [MusicHistoryRepository],
} )
export class MusicHistoryModule {}
