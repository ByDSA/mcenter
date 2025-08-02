import { Module } from "@nestjs/common";
import { EpisodeFileInfosRestController } from "./rest/controller";
import { EpisodeFileInfoRepository } from "./rest/repository/repository";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";

@Module( {
  imports: [
    DomainEventEmitterModule,
  ],
  controllers: [
    EpisodeFileInfosRestController,
  ],
  providers: [
    EpisodeFileInfoRepository,
  ],
  exports: [EpisodeFileInfoRepository],
} )
export class EpisodeFileInfosModule {}
