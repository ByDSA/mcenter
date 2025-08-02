import { Module } from "@nestjs/common";
import { SerieRepository } from "./repositories";
import { DomainEventEmitterModule } from "#main/domain-event-emitter/module";

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
