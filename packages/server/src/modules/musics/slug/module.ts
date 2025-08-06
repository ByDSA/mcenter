import { Module } from "@nestjs/common";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { ResourcesSlugModule } from "#modules/resources/slug/module";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicSlugHandlerService } from "./service";
import { MusicsSlugController } from "./controller";

@Module( {
  imports: [
    MusicHistoryModule,
    MusicsCrudModule,
    ResourceResponseFormatterModule,
    ResourcesSlugModule,
  ],
  controllers: [
    MusicsSlugController,
  ],
  providers: [
    MusicSlugHandlerService,
  ],
  exports: [MusicSlugHandlerService],
} )
export class MusicsSlugModule {}
