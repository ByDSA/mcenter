/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { EpisodesModule } from "../module";
import { EpisodeHistoryEntriesRestController } from "./controllers/rest.controller";
import { EpisodeHistoryEntriesRepository } from "./repositories/repository";
import { LastTimePlayedService } from "./last-time-played.service";
import { DomainEventEmitterModule } from "#main/domain-event-emitter/module";
import { SeriesModule } from "#modules/series/module";

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
