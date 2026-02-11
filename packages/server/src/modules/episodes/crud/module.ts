import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesCrudController } from "./episodes/controller";
import { EpisodesUserInfoCrudController } from "./user-infos/controller";
import { EpisodesRepository } from "./episodes/repository";
import { EpisodesUsersRepository } from "./user-infos/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
  ],
  controllers: [
    EpisodesCrudController,
    EpisodesUserInfoCrudController,
  ],
  providers: [
    EpisodesRepository,
    EpisodesUsersRepository,
  ],
  exports: [EpisodesRepository, EpisodesUsersRepository],
} )
export class EpisodesCrudModule {}
