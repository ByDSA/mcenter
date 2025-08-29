/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicHistoryModule } from "../history/module";
import { MusicFileInfoModule } from "../file-info/module";
import { MusicBuilderService } from "./builder/music-builder.service";
import { MusicCrudController } from "./controller";
import { MusicsRepository } from "./repository";
import { MusicAvailableSlugGeneratorService } from "./builder/vailable-slug-generator.service";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(()=>MusicFileInfoModule),
    forwardRef(()=>MusicHistoryModule),
  ],
  controllers: [
    MusicCrudController,
  ],
  providers: [
    MusicsRepository,
    MusicAvailableSlugGeneratorService,
    MusicBuilderService,
  ],
  exports: [MusicBuilderService, MusicsRepository],
} )
export class MusicsCrudModule {}
