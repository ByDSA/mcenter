import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodeFileInfosCrudController } from "./crud/controller";
import { EpisodeFileInfoRepository } from "./crud/repository/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
  ],
  controllers: [
    EpisodeFileInfosCrudController,
  ],
  providers: [
    EpisodeFileInfoRepository,
  ],
  exports: [EpisodeFileInfoRepository],
} )
export class EpisodeFileInfosModule {}
