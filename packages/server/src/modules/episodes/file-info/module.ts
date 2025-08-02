import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#main/domain-event-emitter/module";
import { EpisodeFileInfosRestController } from "./rest/controller";
import { EpisodeFileInfoRepository } from "./rest/repository/repository";

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
