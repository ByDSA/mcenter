import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodeDependenciesCrudController } from "./controller";
import { EpisodeDependenciesRepository } from "./repository/repository";

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
