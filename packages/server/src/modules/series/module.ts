import { Module } from "@nestjs/common";
import { SerieRepository } from "./repositories";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";

@Module( {
  imports: [
    DomainMessageBrokerModule,
  ],
  controllers: [
  ],
  providers: [
    SerieRepository,
  ],
  exports: [SerieRepository],
} )
export class SeriesModule {}
