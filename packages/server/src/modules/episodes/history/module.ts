import { Module } from "@nestjs/common";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { SeriesModule } from "#modules/series/module";
import { EpisodesModule } from "#episodes/module";
import { EpisodeHistoryListRestController } from "./controllers";
import { EpisodeHistoryListRepository } from "./repositories";
import { LastTimePlayedService } from "./last-time-played.service";

@Module( {
  imports: [
    SeriesModule,
    EpisodesModule,
  ],
  controllers: [
    EpisodeHistoryListRestController,
  ],
  providers: [
    DomainMessageBroker,
    EpisodeHistoryListRepository,
    LastTimePlayedService,
  ],
  exports: [EpisodeHistoryListRepository],
} )
export class EpisodeHistoryListsModule {}
