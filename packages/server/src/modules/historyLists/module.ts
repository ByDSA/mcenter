import { Module } from "@nestjs/common";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { SeriesModule } from "#modules/series/module";
import { EpisodesModule } from "#episodes/module";
import { HistoryListRestController } from "./controllers";
import { HistoryListRepository } from "./repositories";
import { LastTimePlayedService } from "./LastTimePlayedService";

@Module( {
  imports: [
    SeriesModule,
    EpisodesModule,
  ],
  controllers: [
    HistoryListRestController,
  ],
  providers: [
    DomainMessageBroker,
    HistoryListRepository,
    LastTimePlayedService,
  ],
  exports: [HistoryListRepository],
} )
export class EpisodeHistoryListsModule {}
