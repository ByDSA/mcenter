import { Module } from "@nestjs/common";
import { SerieRepository } from "./rest/repository";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";

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
