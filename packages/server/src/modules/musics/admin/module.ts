import { Module } from "@nestjs/common";
import { TasksModule } from "#core/tasks/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicFileInfoModule } from "../file-info/module";
import { MusicFixInfoController } from "./fix-info/fix-info.controller";
import { SearchDuplicatesController } from "./search-duplicates/controller";
import { MusicUpdateRemoteController } from "./update-remote/controller";
import { UpdateRemoteTreeService } from "./update-remote/service";

@Module( {
  imports: [
    MusicsCrudModule,
    MusicFileInfoModule,
    TasksModule,
  ],
  controllers: [
    MusicFixInfoController,
    SearchDuplicatesController,
    MusicUpdateRemoteController,
  ],
  providers: [
    UpdateRemoteTreeService,
  ],
  exports: [],
} )
export class MusicsAdminModule {}
