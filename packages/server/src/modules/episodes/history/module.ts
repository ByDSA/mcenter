import { forwardRef, Module } from "@nestjs/common";
import { EpisodeHistoryEntriesRestController } from "./controllers";
import { EpisodeHistoryEntriesRepository } from "./repositories";
import { LastTimePlayedService } from "./last-time-played.service";
import { EpisodesModule } from "#episodes/module";
import { SeriesModule } from "#modules/series/module";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";

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
