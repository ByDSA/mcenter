import { Module } from "@nestjs/common";
import { EpisodeFileInfosCrudModule } from "#episodes/file-info/crud/module";
import { EpisodeHistoryCrudModule } from "#episodes/history/crud/module";
import { StreamFileModule } from "#modules/resources/stream-file/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodeResponseFormatterModule } from "#episodes/renderer/module";
import { EpisodeSlugHandlerService } from "./service";
import { EpisodesSlugController } from "./controller";

@Module( {
  imports: [
    EpisodeHistoryCrudModule,
    EpisodeFileInfosCrudModule,
    EpisodesCrudModule,
    EpisodeResponseFormatterModule,
    StreamFileModule,
  ],
  controllers: [
    EpisodesSlugController,
  ],
  providers: [
    EpisodeSlugHandlerService,
  ],
  exports: [EpisodeSlugHandlerService],
} )
export class EpisodesSlugModule {}
