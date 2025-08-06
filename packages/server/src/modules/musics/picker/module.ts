import { Module } from "@nestjs/common";
import { MusicHistoryModule } from "../history/module";
import { MusicsCrudModule } from "../crud/module";
import { ResponseFormatterService } from "../../resources/response-formatter/response-formatter.service";
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
    ResponseFormatterService,
  ],
  exports: [],
} )
export class MusicsGetRandomModule {}
