import { Module } from "@nestjs/common";
import { StreamsRepository } from "./repositories";
import { FixerController } from "./controllers/fixer.controller";
import { StreamRestController } from ".";
import { SeriesModule } from "#modules/series/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { DomainEventEmitterModule } from "#main/domain-event-emitter/module";

@Module( {
  imports: [
    DomainEventEmitterModule,
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
