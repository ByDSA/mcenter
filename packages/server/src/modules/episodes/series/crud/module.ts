import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { SeriesRepository } from "./repository";
import { SeriesCrudController } from "./controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    EpisodesCrudModule,
  ],
  controllers: [
    SeriesCrudController,
  ],
  providers: [
    SeriesRepository,
  ],
  exports: [SeriesRepository],
} )
export class SeriesCrudModule {}
