/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { EpisodesCrudController } from "./controller";
import { EpisodesRepository } from "./repositories/episodes";
import { EpisodesUsersRepository } from "./repositories/user-infos";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => EpisodeHistoryModule),
  ],
  controllers: [
    EpisodesCrudController,
  ],
  providers: [
    EpisodesRepository,
    EpisodesUsersRepository,
  ],
  exports: [EpisodesRepository, EpisodesUsersRepository],
} )
export class EpisodesCrudModule {}
