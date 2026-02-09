import { Module } from "@nestjs/common";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicRendererModule } from "../renderer/module";
import { MusicGetRandomController } from "./controller";

@Module( {
  imports: [
    MusicsCrudModule,
    MusicHistoryModule,
    MusicRendererModule,
  ],
  controllers: [
    MusicGetRandomController,
  ],
  providers: [],
  exports: [],
} )
export class MusicsGetRandomModule {}
