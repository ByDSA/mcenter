/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#modules/domain-event-emitter/module";
import { EpisodesModule } from "../module";
import { EpisodeDependenciesRestController } from "./rest/controller";
import { EpisodeDependenciesRepository } from "./rest/repository/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => EpisodesModule),
  ],
  controllers: [
    EpisodeDependenciesRestController,
  ],
  providers: [
    EpisodeDependenciesRepository,
  ],
  exports: [EpisodeDependenciesRepository],
} )
export class EpisodeDependenciesModule {}
