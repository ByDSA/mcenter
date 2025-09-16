import { Module } from "@nestjs/common";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { ResourcesSlugModule } from "#modules/resources/slug/module";
import { MusicRendererService } from "./render.service";

@Module( {
  imports: [
    ResourceResponseFormatterModule,
    ResourcesSlugModule,
  ],
  controllers: [
  ],
  providers: [
    MusicRendererService,
  ],
  exports: [MusicRendererService],
} )
export class MusicRendererModule {}
