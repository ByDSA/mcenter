/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { EpisodesModule } from "#episodes/module";
import { SeriesModule } from "#modules/series/module";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";
import { EpisodeHistoryEntriesRestController } from "./controllers";
import { EpisodeHistoryEntriesRepository } from "./repositories";
import { LastTimePlayedService } from "./last-time-played.service";

@Module( {
  imports: [
    SeriesModule,
    forwardRef(() => EpisodesModule),
    DomainMessageBrokerModule,
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
