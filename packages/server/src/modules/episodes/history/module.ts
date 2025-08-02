/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { EpisodesModule } from "../module";
import { EpisodeHistoryEntriesRestController } from "./rest/controller";
import { EpisodeHistoryEntriesRepository } from "./rest/repository";
import { LastTimePlayedService } from "./last-time-played.service";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesModule,
    forwardRef(() => EpisodesModule),
  ],
  controllers: [
    EpisodeHistoryEntriesRestController,
  ],
  providers: [
    EpisodeHistoryEntriesRepository,
    LastTimePlayedService,
  ],
  exports: [EpisodeHistoryEntriesRepository, LastTimePlayedService],
} )
export class EpisodeHistoryEntriesModule {}
