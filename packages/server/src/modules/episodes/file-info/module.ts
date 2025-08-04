import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodeFileInfosCrudController } from "./crud/controller";
import { EpisodeFileInfosRepository } from "./crud/repository/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
  ],
  controllers: [
    EpisodeFileInfosCrudController,
  ],
  providers: [
    EpisodeFileInfosRepository,
  ],
  exports: [EpisodeFileInfosRepository],
} )
export class EpisodeFileInfosModule {}
