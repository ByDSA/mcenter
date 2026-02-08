import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesCrudController } from "./controller";
import { EpisodesRepository } from "./repositories/episodes";
import { EpisodesUsersRepository } from "./repositories/user-infos";

@Module( {
  imports: [
    DomainEventEmitterModule,
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
