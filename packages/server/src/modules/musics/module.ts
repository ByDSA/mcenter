/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { MusicsHistoryModule } from "./history/module";
import { MusicGetController } from "./controllers/get.controller";
import { MusicFixController } from "./controllers/fix.controller";
import { UpdateRemoteTreeService } from "./update-remote/service";
import { MusicRestController } from "./rest/controller";
import { MusicUpdateRemoteController } from "./update-remote/controller";
import { MusicRepository } from "./rest/repository";
import { MusicBuilderService } from "./builder/music-builder.service";
import { MusicFileInfoRepository } from "./file-info/rest/repository";
import { MusicUrlGeneratorService } from "./builder/url-generator.service";
import { RawHandlerService } from "./controllers/raw-handler.service";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(() => MusicsHistoryModule),
  ],
  controllers: [
    MusicRestController,
    MusicGetController,
    MusicFixController,
    MusicUpdateRemoteController,
  ],
  providers: [
    MusicRepository,
    MusicFileInfoRepository,
    MusicBuilderService,
    MusicUrlGeneratorService,
    UpdateRemoteTreeService,
    RawHandlerService,
  ],
  exports: [MusicRepository],
} )
export class MusicsModule {}
