import { Module } from "@nestjs/common";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { ResourcesSlugModule } from "#modules/resources/slug/module";
import { EpisodeRendererService } from "./render.service";

@Module( {
  imports: [
    ResourceResponseFormatterModule,
    ResourcesSlugModule,
  ],
  controllers: [
  ],
  providers: [
    EpisodeRendererService,
  ],
  exports: [EpisodeRendererService],
} )
export class EpisodeRendererModule {}
