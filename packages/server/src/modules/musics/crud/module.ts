/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicHistoryModule } from "../history/module";
import { MusicBuilderService } from "./builder/music-builder.service";
import { MusicCrudController } from "./controller";
import { MusicsRepository } from "./repository";
import { MusicSlugGeneratorService } from "./builder/slug-generator.service";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(()=>MusicHistoryModule),
  ],
  controllers: [
    MusicCrudController,
  ],
  providers: [
    MusicsRepository,
    MusicSlugGeneratorService,
    MusicBuilderService,
  ],
  exports: [MusicsRepository],
} )
export class MusicsCrudModule {}
