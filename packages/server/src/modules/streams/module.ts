import { Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { EpisodeHistoryEntriesModule } from "#episodes/history/module";
import { DomainEventEmitterModule } from "#main/domain-event-emitter/module";
import { StreamsRepository } from "./rest/repository";
import { FixerController } from "./controllers/fixer.controller";
import { StreamsRestController } from "./rest/controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesModule,
    EpisodeHistoryEntriesModule,
  ],
  controllers: [
    StreamsRestController,
    FixerController,
  ],
  providers: [
    StreamsRepository,
  ],
  exports: [StreamsRepository],
} )
export class StreamsModule {}
