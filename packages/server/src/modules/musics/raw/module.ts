import { Module } from "@nestjs/common";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../rest/module";
import { RawHandlerService } from "./service";
import { MusicGetRawController } from "./controller";

@Module( {
  imports: [
    MusicHistoryModule,
    MusicsCrudModule,
  ],
  controllers: [
    MusicGetRawController,
  ],
  providers: [
    RawHandlerService,
  ],
  exports: [],
} )
export class MusicsGetRawModule {}
