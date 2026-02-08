import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { StreamsCrudModule } from "#episodes/streams/crud/module";
import { EpisodeHistoryRepository } from "./repository";
import { EpisodeHistoryCrudController } from "./controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    StreamsCrudModule,
  ],
  controllers: [
    EpisodeHistoryCrudController,
  ],
  providers: [
    EpisodeHistoryRepository,
  ],
  exports: [EpisodeHistoryRepository],
} )
export class EpisodeHistoryCrudModule {}
