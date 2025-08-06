import { Module } from "@nestjs/common";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { EpisodeFileInfosModule } from "#episodes/file-info/module";
import { EpisodeHistoryModule } from "#episodes/history/module";
import { ResourcesSlugModule } from "#modules/resources/slug/module";
import { EpisodesCrudModule } from "#episodes/crud/module";
import { EpisodesSlugController } from "./controller";
import { EpisodeSlugHandlerService } from "./service";

@Module( {
  imports: [
    EpisodeHistoryModule,
    EpisodeFileInfosModule,
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
