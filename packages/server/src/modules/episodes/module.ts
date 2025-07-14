import { Module } from "@nestjs/common";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeFileInfoRepository } from "#modules/file-info/repositories";
import { SerieRepository } from "#modules/series";
import { EpisodesRestController } from "./controllers/rest.controller";
import { EpisodeRepository } from "./repositories";

@Module( {
  imports: [
  ],
  controllers: [
    EpisodesRestController,
  ],
  providers: [
    DomainMessageBroker,
    EpisodeRepository,
    EpisodeFileInfoRepository,
    SerieRepository,
  ],
  exports: [EpisodeRepository],
} )
export class EpisodesModule {}
