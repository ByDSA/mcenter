import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#modules/domain-event-emitter/module";
import { EpisodeFileInfosRestController } from "./controllers/rest.controller";
import { EpisodeFileInfoRepository } from "./repositories/repository";

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
