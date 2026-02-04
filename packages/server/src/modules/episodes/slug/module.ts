import { Module } from "@nestjs/common";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { EpisodeFileInfosCrudModule } from "#episodes/file-info/crud/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { ResourcesSlugModule } from "#modules/resources/slug/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodesSlugController } from "./controller";
import { EpisodeSlugHandlerService } from "./service";

@Module( {
  imports: [
    EpisodeHistoryModule,
    EpisodeFileInfosCrudModule,
    EpisodesCrudModule,
    ResourceResponseFormatterModule,
    ResourcesSlugModule,
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
