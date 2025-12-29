import { Module } from "@nestjs/common";
import { ResourceResponseFormatterModule } from "#modules/resources/response-formatter";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicGetRandomController } from "./controller";

@Module( {
  imports: [
    MusicsCrudModule,
    MusicHistoryModule,
    ResourceResponseFormatterModule,
  ],
  controllers: [
    MusicGetRandomController,
  ],
  providers: [],
  exports: [],
} )
export class MusicsGetRandomModule {}
