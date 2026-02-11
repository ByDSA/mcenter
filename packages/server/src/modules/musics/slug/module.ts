import { Module } from "@nestjs/common";
import { MusicsCrudModule } from "../crud/module";
import { MusicRendererModule } from "../renderer/module";
import { MusicsSlugController } from "./controller";

@Module( {
  imports: [
    MusicsCrudModule,
    MusicRendererModule,
  ],
  controllers: [
    MusicsSlugController,
  ],
  providers: [
  ],
  exports: [],
} )
export class MusicsSlugModule {}
