import { Module } from "@nestjs/common";
import { TasksModule } from "#core/tasks/module";
import { MusicsCrudModule } from "../crud/module";
import { MusicFileInfoModule } from "../file-info/module";
import { MusicFixInfoController } from "./fix-info/fix-info.controller";
import { SearchDuplicatesController } from "./search-duplicates/controller";
import { MusicUpdateRemoteController } from "./update-remote/controller";
import { UpdateRemoteTreeService } from "./update-remote/service";
import { MusicUpdateRemoteTaskHandler } from "./update-remote/task.handler";
import { MusicUpdateFileInfoController } from "./update-file-info/controller";
import { MusicUpdateFileInfoTaskHandler } from "./update-file-info/task.handler";

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
    MusicUpdateFileInfoController,
  ],
  providers: [
    UpdateRemoteTreeService,
    MusicUpdateRemoteTaskHandler,
    MusicUpdateFileInfoTaskHandler,
  ],
  exports: [],
} )
export class MusicsAdminModule {}
