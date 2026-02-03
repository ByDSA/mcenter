import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicFileInfoRepository } from ".//repository";
import { MusicFileInfoController } from "./controller";

@Module( {
  imports: [
    DomainEventEmitterModule,
  ],
  controllers: [
    MusicFileInfoController,
  ],
  providers: [
    MusicFileInfoRepository,
  ],
  exports: [MusicFileInfoRepository],
} )
export class MusicFileInfoCrudModule {}
