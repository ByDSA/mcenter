/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { EpisodeFileInfosModule } from "#episodes/file-info/module";
import { EpisodesCrudController } from "./controller";
import { EpisodesRepository } from "./repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => EpisodeFileInfosModule),
    forwardRef(() => EpisodeHistoryModule),
  ],
  controllers: [
    EpisodesCrudController,
  ],
  providers: [
    EpisodesRepository,
  ],
  exports: [EpisodesRepository],
} )
export class EpisodesCrudModule {}
