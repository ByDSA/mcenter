/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { SeriesCrudModule } from "#episodes/series/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { StreamsModule } from "#episodes/streams/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { LastTimePlayedService } from "./last-time-played.service";
import { EpisodeHistoryRepository } from "./crud/repository";
import { EpisodeHistoryCrudController } from "./crud/controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => SeriesCrudModule),
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
