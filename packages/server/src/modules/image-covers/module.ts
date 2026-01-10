import { Module } from "@nestjs/common";
import { DomainEventEmitterModule } from "#core/domain-event-emitter/module";
import { ImageCoverCrudController } from "./controller";
import { ImageCoversRepository } from "./repositories";
import { ImageCoversUploadService } from "./upload.service";

@Module( {
  imports: [
    DomainEventEmitterModule,
  ],
  controllers: [
    ImageCoverCrudController,
  ],
  providers: [
    ImageCoversRepository,
    ImageCoversUploadService,
  ],
  exports: [ImageCoversRepository],
} )
export class ImageCoversCrudModule {}
