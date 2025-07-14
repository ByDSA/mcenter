import { Module } from "@nestjs/common";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { SerieRepository } from "./repositories";

@Module( {
  imports: [
  ],
  controllers: [
  ],
  providers: [
    SerieRepository,
    DomainMessageBroker,
  ],
  exports: [SerieRepository],
} )
export class SeriesModule {}
