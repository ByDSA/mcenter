/* eslint-disable import/no-cycle */
import { forwardRef, Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicFileInfoRepository } from "./crud/repository";
import { MusicFileInfoController } from "./controller";
import { MusicFileInfoUploadRepository } from "./upload.repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
    forwardRef(()=>MusicsCrudModule),
  ],
  controllers: [
    MusicFileInfoController,
  ],
  providers: [
    MusicFileInfoRepository,
    MusicFileInfoUploadRepository,
  ],
  exports: [MusicFileInfoRepository],
} )
export class MusicFileInfoModule {}
