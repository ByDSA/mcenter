import { Module } from "@nestjs/common";
import { EpisodeDependenciesCrudController } from "./controller";
import { EpisodeDependenciesRepository } from "./repository/repository";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";

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
