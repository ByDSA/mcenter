import { Module } from "@nestjs/common";
import { ImageCoversCrudModule } from "../crud/module";
import { ImageCoverUploadController } from "./controller";
import { ImageCoversUploadService } from "./service";
import { ImageVersionsGenerator } from "./generate-versions";

@Module( {
  imports: [
    ImageCoversCrudModule,
  ],
  controllers: [
    ImageCoverUploadController,
  ],
  providers: [
    ImageCoversUploadService,
    ImageVersionsGenerator,
  ],
  exports: [ImageCoversUploadService, ImageVersionsGenerator],
} )
export class ImageCoversUploadModule {}
