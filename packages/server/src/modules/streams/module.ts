import { Module } from "@nestjs/common";
import { SeriesModule } from "#modules/series/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { StreamsRepository } from "./crud/repository";
import { FixerController } from "./controllers/fixer.controller";
import { StreamsCrudController } from "./crud/controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesModule,
    EpisodeHistoryModule,
  ],
  controllers: [
    StreamsCrudController,
    FixerController,
  ],
  providers: [
    StreamsRepository,
  ],
  exports: [StreamsRepository],
} )
export class StreamsModule {}
