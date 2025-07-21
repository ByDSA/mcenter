import { Module } from "@nestjs/common";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";
import { EpisodeFileInfosRestController } from "./controllers/rest.controller";
import { EpisodeFileInfoRepository } from "./repositories/repository";

@Module( {
  imports: [
    DomainMessageBrokerModule,
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
