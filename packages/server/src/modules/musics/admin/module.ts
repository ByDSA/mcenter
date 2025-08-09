import { Module } from "@nestjs/common";
import { MusicsCrudModule } from "../crud/module";
import { MusicFixInfoController } from "./fix-info/fix-info.controller";

@Module( {
  imports: [
    MusicsCrudModule,
  ],
  controllers: [
    MusicFixInfoController
  ],
  providers: [
  ],
  exports: [],
} )
export class MusicsAdminModule {}
