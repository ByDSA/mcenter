import { Module } from "@nestjs/common";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { ResourcesSlugModule } from "#modules/resources/slug/module";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicRendererModule } from "../renderer/module";
import { MusicsSlugController } from "./controller";

@Module( {
  imports: [
    MusicHistoryModule,
    MusicsCrudModule,
    ResourceResponseFormatterModule,
    MusicRendererModule,
    ResourcesSlugModule,
  ],
  controllers: [
    MusicsSlugController,
  ],
  providers: [
  ],
  exports: [],
} )
export class MusicsSlugModule {}
