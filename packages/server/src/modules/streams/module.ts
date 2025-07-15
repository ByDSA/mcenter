import { Module } from "@nestjs/common";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { SeriesModule } from "#modules/series/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { StreamsRepository } from "./repositories";
import { StreamRestController } from ".";

@Module( {
  imports: [
    SeriesModule, EpisodeHistoryEntriesModule,
  ],
  controllers: [
    StreamRestController,
  ],
  providers: [
    StreamsRepository,
    DomainMessageBroker,
  ],
  exports: [StreamsRepository],
} )
export class StreamsModule {}
