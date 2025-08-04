/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesModule } from "../module";
import { EpisodeHistoryEntriesCrudController } from "./crud/controller";
import { EpisodeHistoryEntriesRepository } from "./crud/repository";
import { LastTimePlayedService } from "./last-time-played.service";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesModule,
    forwardRef(() => EpisodesModule),
  ],
  controllers: [
    EpisodeHistoryEntriesCrudController,
  ],
  providers: [
    EpisodeHistoryEntriesRepository,
    LastTimePlayedService,
  ],
  exports: [EpisodeHistoryEntriesRepository, LastTimePlayedService],
} )
export class EpisodeHistoryEntriesModule {}
