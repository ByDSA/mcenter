import { Module } from "@nestjs/common";
import { EpisodeFileInfosCrudModule } from "../crud/module";
import { EpisodeFileInfoSyncService } from "./service";

@Module( {
  imports: [
    EpisodeFileInfosCrudModule,
  ],
  controllers: [
  ],
  providers: [
    EpisodeFileInfoSyncService,
  ],
  exports: [EpisodeFileInfoSyncService],
} )
export class EpisodeFileInfosSyncModule {}
