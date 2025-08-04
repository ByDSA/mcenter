/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesModule } from "../module";
import { EpisodeHistoryCrudController } from "./crud/controller";
import { EpisodeHistoryRepository } from "./crud/repository";
import { LastTimePlayedService } from "./last-time-played.service";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesModule,
    forwardRef(() => EpisodesModule),
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
