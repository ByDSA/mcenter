/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { SeriesCrudModule } from "#episodes/series/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UsersModule } from "#core/auth/users";
import { StreamsCrudController } from "./crud/controller";
import { FixerController } from "./controllers/fixer.controller";
import { StreamsRepository } from "./crud/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => SeriesCrudModule),
    forwardRef(() => EpisodeHistoryModule),
    UsersModule,
  ],
  controllers: [
    StreamsCrudController,
    FixerController,
  ],
  providers: [
    StreamsRepository,
  ],
  exports: [StreamsRepository],
} )
export class StreamsModule {}
