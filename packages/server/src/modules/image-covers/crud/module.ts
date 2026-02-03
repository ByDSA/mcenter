import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { ImageCoverCrudController } from "./controller";
import { ImageCoversRepository } from "./repositories";

@Module( {
  imports: [
    DomainEventEmitterModule,
  ],
  controllers: [
    ImageCoverCrudController,
  ],
  providers: [
    ImageCoversRepository,
  ],
  exports: [ImageCoversRepository],
} )
export class ImageCoversCrudModule {}
