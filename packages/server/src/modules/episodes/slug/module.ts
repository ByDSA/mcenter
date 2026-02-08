import { Module } from "@nestjs/common";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { EpisodeFileInfosCrudModule } from "#episodes/file-info/crud/module";
import { EpisodeHistoryCrudModule } from "#episodes/history/crud/module";
import { ResourcesSlugModule } from "#modules/resources/slug/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodeSlugHandlerService } from "./service";
import { EpisodesSlugController } from "./controller";

@Module( {
  imports: [
    EpisodeHistoryCrudModule,
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
