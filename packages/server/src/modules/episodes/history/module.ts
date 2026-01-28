import { forwardRef, Module } from "@nestjs/common";
import { EpisodeHistoryCrudController } from "./crud/controller";
import { EpisodeHistoryRepository } from "./crud/repository";
import { LastTimePlayedService } from "./last-time-played.service";
import { SeriesModule } from "#episodes/series/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { StreamsModule } from "#episodes/streams/module";
import { EpisodesCrudModule } from "#episodes/crud/module";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesModule,
    forwardRef(() => StreamsModule),
    forwardRef(() => EpisodesCrudModule),
  ],
  controllers: [
    EpisodeHistoryCrudController,
  ],
  providers: [
    EpisodeHistoryRepository,
    LastTimePlayedService,
  ],
  exports: [EpisodeHistoryRepository, LastTimePlayedService],
} )
export class EpisodeHistoryModule {}
