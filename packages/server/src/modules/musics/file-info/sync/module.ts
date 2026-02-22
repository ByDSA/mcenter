import { Module } from "@nestjs/common";
import { MusicFileInfoCrudModule } from "../crud/module";
import { MusicFileInfoSyncService } from "./service";

@Module( {
  imports: [
    MusicFileInfoCrudModule,
  ],
  controllers: [
  ],
  providers: [
    MusicFileInfoSyncService,
  ],
  exports: [MusicFileInfoSyncService],
} )
export class MusicFileInfosSyncModule {}
