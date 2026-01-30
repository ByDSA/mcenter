import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { SeriesRepository } from "./crud/repository";
import { SeriesCrudController } from "./crud/controller";
import { SeriesAvailableSlugGeneratorService } from "./crud/repository/available-slug-generator.service";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => EpisodesCrudModule),
  ],
  controllers: [
    SeriesCrudController,
  ],
  providers: [
    SeriesRepository,
    SeriesAvailableSlugGeneratorService,
  ],
  exports: [SeriesRepository],
} )
export class SeriesCrudModule {}
