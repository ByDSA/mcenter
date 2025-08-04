import { Module } from "@nestjs/common";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../crud/module";
import { SlugHandlerService } from "./service";
import { MusicsSlugController } from "./controller";

@Module( {
  imports: [
    MusicHistoryModule,
    MusicsCrudModule,
  ],
  controllers: [
    MusicsSlugController,
  ],
  providers: [
    SlugHandlerService,
  ],
  exports: [],
} )
export class MusicsSlugModule {}
