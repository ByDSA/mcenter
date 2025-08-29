/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicFileInfoRepository } from "./crud/repository";
import { UploadMusicFileInfoController } from "./upload.controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(()=>MusicsCrudModule),
  ],
  controllers: [
    UploadMusicFileInfoController,
  ],
  providers: [
    MusicFileInfoRepository,
  ],
  exports: [MusicFileInfoRepository],
} )
export class MusicFileInfoModule {}
