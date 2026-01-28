import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { SeriesRepository } from "./crud/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
  ],
  controllers: [
  ],
  providers: [
    SeriesRepository,
  ],
  exports: [SeriesRepository],
} )
export class SeriesModule {}
