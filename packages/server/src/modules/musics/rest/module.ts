import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicHistoryModule } from "../history/module";
import { MusicBuilderService } from "./builder/music-builder.service";
import { MusicRestController } from "./controller";
import { MusicRepository } from "./repository";
import { MusicUrlGeneratorService } from "./builder/url-generator.service";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(()=>MusicHistoryModule),
  ],
  controllers: [
    MusicRestController,
  ],
  providers: [
    MusicRepository,
    MusicUrlGeneratorService,
    MusicBuilderService,
  ],
  exports: [MusicRepository],
} )
export class MusicsCrudModule {}
