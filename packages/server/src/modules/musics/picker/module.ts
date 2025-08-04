import { Module } from "@nestjs/common";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicGetRandomController } from "./controller";

@Module( {
  imports: [
    MusicsCrudModule,
    MusicHistoryModule,
  ],
  controllers: [
    MusicGetRandomController,
  ],
  providers: [
  ],
  exports: [],
} )
export class MusicsGetRandomModule {}
