import { Module } from "@nestjs/common";
import { StreamFileModule } from "#modules/resources/stream-file/module";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicRendererModule } from "../renderer/module";
import { MusicsSlugController } from "./controller";

@Module( {
  imports: [
    MusicHistoryModule,
    MusicsCrudModule,
    MusicRendererModule,
    StreamFileModule,
  ],
  controllers: [
    MusicsSlugController,
  ],
  providers: [
  ],
  exports: [],
} )
export class MusicsSlugModule {}
