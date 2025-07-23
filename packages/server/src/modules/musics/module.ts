/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainMessageBrokerModule } from "#modules/domain-message-broker/module";
import { MusicsHistoryModule } from "./history/module";
import { MusicGetController } from "./controllers/get.controller";
import { MusicFixController } from "./controllers/fix.controller";
import { UpdateRemoteTreeService } from "./services";
import { MusicRestController } from "./controllers/rest.controller";
import { MusicUpdateRemoteController } from "./controllers/update-remote.controller";
import { MusicRepository } from "./repositories";
import { MusicBuilderService } from "./builder/music-builder.service";
import { MusicFileInfoRepository } from "./file-info/repositories/repository";
import { MusicUrlGeneratorService } from "./builder/url-generator.service";
import { RawHandlerService } from "./controllers/raw-handler.service";

@Module( {
  imports: [
    DomainMessageBrokerModule,
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
