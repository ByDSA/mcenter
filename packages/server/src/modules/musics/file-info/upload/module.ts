import { Module } from "@nestjs/common";
import { MusicsCrudModule } from "../../crud/module";
import { MusicFileInfoCrudModule } from "../crud/module";
import { MusicFileInfoUploadController } from "./controller";
import { MusicFileInfoUploadRepository } from "./service";

@Module( {
  imports: [
    MusicsCrudModule,
    MusicFileInfoCrudModule,
  ],
  controllers: [
    MusicFileInfoUploadController,
  ],
  providers: [
    MusicFileInfoUploadRepository,
  ],
  exports: [MusicFileInfoUploadRepository],
} )
export class MusicFileInfoUploadModule {}
