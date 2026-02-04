import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { RemoteSeriesTreeService } from "../../admin/sync-disk-to-db/db";
import { EpisodeFileInfosCrudController } from "./controller";
import { EpisodeFileInfosRepository } from "./repository/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
    EpisodesCrudModule,
  ],
  controllers: [
    EpisodeFileInfosCrudController,
  ],
  providers: [
    EpisodeFileInfosRepository,
    RemoteSeriesTreeService,
  ],
  exports: [EpisodeFileInfosRepository, RemoteSeriesTreeService],
} )
export class EpisodeFileInfosCrudModule {}
