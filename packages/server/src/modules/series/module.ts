import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#main/domain-event-emitter/module";
import { SerieRepository } from "./rest/repository";

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
