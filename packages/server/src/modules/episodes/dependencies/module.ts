/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { EpisodesModule } from "../module";
import { EpisodeDependenciesRestController } from "./rest/controller";
import { EpisodeDependenciesRepository } from "./rest/repository/repository";
import { DomainEventEmitterModule } from "#main/domain-event-emitter/module";

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
