/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { RemoteSeriesTreeService } from "../admin/sync-disk-to-db/db";
import { EpisodeFileInfosCrudController } from "./crud/controller";
import { EpisodeFileInfosRepository } from "./crud/repository/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => EpisodesCrudModule),
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
export class EpisodeFileInfosModule {}
