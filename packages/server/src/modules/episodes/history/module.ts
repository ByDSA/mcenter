/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { SeriesModule } from "#modules/series/module";
import { EpisodesModule } from "#episodes/module";
import { EpisodeHistoryEntriesRestController } from "./controllers";
import { EpisodeHistoryEntriesRepository } from "./repositories";
import { LastTimePlayedService } from "./last-time-played.service";

@Module( {
  imports: [
    SeriesModule,
    forwardRef(() => EpisodesModule),
  ],
  controllers: [
    EpisodeHistoryEntriesRestController,
  ],
  providers: [
    DomainMessageBroker,
    EpisodeHistoryEntriesRepository,
    LastTimePlayedService,
  ],
  exports: [EpisodeHistoryEntriesRepository, LastTimePlayedService],
} )
export class EpisodeHistoryEntriesModule {}
