import { Module } from "@nestjs/common";
import { VideoMetadataModule } from "#modules/resources/video/video-metadata/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodeFileInfosCrudModule } from "../crud/module";
import { EpisodeFileInfoUploadService } from "./service";
import { EpisodeFileInfosUploadController } from "./controller";

@Module( {
  imports: [
    EpisodeFileInfosCrudModule,
    VideoMetadataModule,
    EpisodesCrudModule,
  ],
  controllers: [
    EpisodeFileInfosUploadController,
  ],
  providers: [
    EpisodeFileInfoUploadService,
  ],
  exports: [EpisodeFileInfoUploadService],
} )
export class EpisodeFileInfosUploadModule {}
