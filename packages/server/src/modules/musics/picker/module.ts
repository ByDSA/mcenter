import { Module } from "@nestjs/common";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicRendererModule } from "../renderer/module";
import { MusicGetRandomController } from "./controller";
import { MusicGetRandomService } from "./service";

@Module( {
  imports: [
    MusicsCrudModule,
    MusicHistoryModule,
    MusicRendererModule,
  ],
  controllers: [
    MusicGetRandomController,
  ],
  providers: [MusicGetRandomService],
  exports: [],
} )
export class MusicsGetRandomModule {}
