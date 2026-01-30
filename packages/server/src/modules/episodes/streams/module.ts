import { forwardRef, Module } from "@nestjs/common";
import { StreamsRepository } from "./crud/repository";
import { FixerController } from "./controllers/fixer.controller";
import { StreamsCrudController } from "./crud/controller";
import { SeriesCrudModule } from "#episodes/series/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { UsersModule } from "#core/auth/users";

@Module( {
  imports: [
    DomainEventEmitterModule,
    SeriesCrudModule,
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
