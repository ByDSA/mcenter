import { Module } from "@nestjs/common";
import { TasksModule } from "#core/tasks";
import { ImageCoversUploadModule } from "../upload/module";
import { ImageCoversCrudModule } from "../crud/module";
import { ImageCoversRebuildAllController } from "./task-rebuild/controller";
import { ImageCoversRebuildAllTaskHandler } from "./task-rebuild/task.handler";

@Module( {
  imports: [
    ImageCoversCrudModule,
    ImageCoversUploadModule,
    TasksModule,
  ],
  controllers: [
    ImageCoversRebuildAllController,
  ],
  providers: [
    ImageCoversRebuildAllTaskHandler,
  ],
  exports: [],
} )
export class ImageCoversAdminModule {}
