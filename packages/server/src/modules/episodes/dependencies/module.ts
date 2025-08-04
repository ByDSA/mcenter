/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesModule } from "../module";
import { EpisodeDependenciesCrudController } from "./crud/controller";
import { EpisodeDependenciesRepository } from "./crud/repository/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => EpisodesModule),
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
