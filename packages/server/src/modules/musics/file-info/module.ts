import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicFileInfoRepository } from "./crud/repository";

@Module( {
  imports: [
    DomainEventEmitterModule,
    MusicsCrudModule,
  ],
  controllers: [
  ],
  providers: [
    MusicFileInfoRepository,
  ],
  exports: [MusicFileInfoRepository],
} )
export class MusicFileInfoModule {}
