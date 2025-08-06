import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodeDependenciesCrudController } from "./crud/controller";
import { EpisodeDependenciesRepository } from "./crud/repository/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
  ],
  controllers: [
    EpisodeDependenciesCrudController,
  ],
  providers: [
    EpisodeDependenciesRepository,
  ],
  exports: [EpisodeDependenciesRepository],
} )
export class EpisodeDependenciesModule {}
