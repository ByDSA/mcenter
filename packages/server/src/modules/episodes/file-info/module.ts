import { Module } from "@nestjs/common";
import { EpisodeFileInfosRestController } from "./controllers/rest.controller";
import { EpisodeFileInfoRepository } from "./repositories/repository";
import { DomainEventEmitterModule } from "#main/domain-event-emitter/module";

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
