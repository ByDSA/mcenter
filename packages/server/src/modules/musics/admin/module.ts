import { Module } from "@nestjs/common";
import { MusicsCrudModule } from "../crud/module";
import { MusicFileInfoCrudModule } from "../file-info/crud/module";
import { MusicFileInfosSyncModule } from "../file-info/sync/module";
import { MusicFixInfoController } from "./fix-info/controller";
import { SearchDuplicatesController } from "./search-duplicates/controller";
import { MusicUpdateRemoteController } from "./update-remote/controller";
import { UpdateRemoteTreeService } from "./update-remote/service";
import { MusicUpdateRemoteTaskHandler } from "./update-remote/task.handler";
import { MusicUpdateFileInfoController } from "./update-file-info/controller";
import { MusicUpdateFileInfoTaskHandler } from "./update-file-info/task.handler";
import { SearchDuplicatesService } from "./search-duplicates/service";
import { MusicUpdateFileInfoOffloadedController } from "./update-file-info-offloaded/controller";
import { MusicUpdateFileInfoOffloadedTaskHandler } from "./update-file-info-offloaded/task.handler";
import { TasksModule } from "#core/tasks/module";

@Module( {
  imports: [
    MusicsCrudModule,
    MusicFileInfoCrudModule,
    TasksModule,
    MusicFileInfosSyncModule,
  ],
  controllers: [
    MusicFixInfoController,
    SearchDuplicatesController,
    MusicUpdateRemoteController,
    MusicUpdateFileInfoController,
    MusicUpdateFileInfoOffloadedController,
  ],
  providers: [
    SearchDuplicatesService,
    UpdateRemoteTreeService,
    MusicUpdateRemoteTaskHandler,
    MusicUpdateFileInfoTaskHandler,
    MusicUpdateFileInfoOffloadedTaskHandler,
  ],
  exports: [],
} )
export class MusicsAdminModule {}
