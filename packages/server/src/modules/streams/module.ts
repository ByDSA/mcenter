import { Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";
import { StreamsRepository } from "./repositories";
import { FixerController } from "./controllers/fixer.controller";
import { StreamRestController } from ".";

@Module( {
  imports: [
    DomainMessageBrokerModule,
    SeriesModule,
    EpisodeHistoryEntriesModule,
  ],
  controllers: [
    StreamRestController,
    FixerController,
  ],
  providers: [
    StreamsRepository,
  ],
  exports: [StreamsRepository],
} )
export class StreamsModule {}
