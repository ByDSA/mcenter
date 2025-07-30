import { Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { DomainEventEmitterModule } from "#modules/domain-event-emitter/module";
import { StreamsRepository } from "./repositories";
import { FixerController } from "./controllers/fixer.controller";
import { StreamRestController } from ".";

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
