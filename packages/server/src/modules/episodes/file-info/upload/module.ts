import { Module } from "@nestjs/common";
import { EpisodeFileInfosCrudModule } from "../crud/module";
import { EpisodeFileInfoUploadService } from "./service";
import { EpisodeFileInfosUploadController } from "./controller";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { VideoMetadataModule } from "#modules/resources/video/video-metadata/module";
import { SeriesCrudModule } from "#episodes/series/crud/module";

@Module( {
  imports: [
    EpisodeFileInfosCrudModule,
    VideoMetadataModule,
    EpisodesCrudModule,
    SeriesCrudModule,
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
