import { Module } from "@nestjs/common";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../rest/module";
import { MusicGetRandomController } from "./get.controller";

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
