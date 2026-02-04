import { Module } from "@nestjs/common";
import { VideoMetadataService } from "./VideoMetadataService.service";

@Module( {
  providers: [
    VideoMetadataService,
  ],
  exports: [VideoMetadataService],
} )
export class VideoMetadataModule {}
