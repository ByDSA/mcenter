/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodeFileInfosCrudController } from "./crud/controller";
import { EpisodeFileInfosRepository } from "./crud/repository/repository";
import { RemoteSeriesTreeService } from "./series-tree/remote";

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
