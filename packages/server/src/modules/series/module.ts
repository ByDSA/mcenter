import { Module } from "@nestjs/common";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";
import { SerieRepository } from "./repositories";

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
