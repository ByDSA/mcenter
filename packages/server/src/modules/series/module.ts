import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#modules/domain-event-emitter/module";
import { SerieRepository } from "./repositories";

@Module( {
  imports: [
    DomainEventEmitterModule,
  ],
  controllers: [
  ],
  providers: [
    SerieRepository,
  ],
  exports: [SerieRepository],
} )
export class SeriesModule {}
